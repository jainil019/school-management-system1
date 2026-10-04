from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db

from app.models.teacher_assignment import TeacherAssignment
from app.models.teacher import Teacher
from app.models.class_model import Class
from app.models.section import Section
from app.models.subject import Subject
from app.models.academic_year import AcademicYear
from app.models.class_subject import ClassSubject

from app.schemas.teacher_assignment import (
    TeacherAssignmentCreate,
    TeacherAssignmentUpdate,
    TeacherAssignmentResponse,
)


router = APIRouter(
    prefix="/teacher-assignments",
    tags=["Teacher Assignments"],
)


def validate_assignment_data(
    data,
    db: Session,
):
    # Teacher
    teacher = db.get(Teacher, data.teacher_id)

    if teacher is None:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found",
        )

    # Class
    class_obj = db.get(Class, data.class_id)

    if class_obj is None:
        raise HTTPException(
            status_code=404,
            detail="Class not found",
        )

    # Section
    section = db.get(Section, data.section_id)

    if section is None:
        raise HTTPException(
            status_code=404,
            detail="Section not found",
        )

    # Section must belong to selected class
    if section.class_id != data.class_id:
        raise HTTPException(
            status_code=400,
            detail="Section does not belong to selected class",
        )

    # Subject
    subject = db.get(Subject, data.subject_id)

    if subject is None:
        raise HTTPException(
            status_code=404,
            detail="Subject not found",
        )

    # Academic year
    academic_year = db.get(
        AcademicYear,
        data.academic_year_id,
    )

    if academic_year is None:
        raise HTTPException(
            status_code=404,
            detail="Academic year not found",
        )

    # Subject must already be assigned to class
    class_subject = db.scalar(
        select(ClassSubject).where(
            ClassSubject.class_id == data.class_id,
            ClassSubject.subject_id == data.subject_id,
        )
    )

    if class_subject is None:
        raise HTTPException(
            status_code=400,
            detail="Subject is not assigned to this class",
        )


@router.post(
    "",
    response_model=TeacherAssignmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_teacher_assignment(
    data: TeacherAssignmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    validate_assignment_data(data, db)

    existing = db.scalar(
        select(TeacherAssignment).where(
            TeacherAssignment.teacher_id == data.teacher_id,
            TeacherAssignment.class_id == data.class_id,
            TeacherAssignment.section_id == data.section_id,
            TeacherAssignment.subject_id == data.subject_id,
            TeacherAssignment.academic_year_id
            == data.academic_year_id,
        )
    )

    if existing is not None:
        raise HTTPException(
            status_code=409,
            detail="Teacher assignment already exists",
        )

    assignment = TeacherAssignment(
        teacher_id=data.teacher_id,
        class_id=data.class_id,
        section_id=data.section_id,
        subject_id=data.subject_id,
        academic_year_id=data.academic_year_id,
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return assignment


@router.get(
    "",
    response_model=list[TeacherAssignmentResponse],
)
def get_teacher_assignments(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    statement = select(TeacherAssignment)

    # TEACHER can only see their own assignments
    if current_user.role.name == "TEACHER":
        teacher = db.scalar(
            select(Teacher).where(
                Teacher.user_id == current_user.id
            )
        )

        if teacher is None:
            raise HTTPException(
                status_code=404,
                detail="Teacher profile not found",
            )

        statement = statement.where(
            TeacherAssignment.teacher_id == teacher.id
        )

    statement = statement.order_by(
        TeacherAssignment.id.desc()
    )

    return db.scalars(statement).all()


@router.get(
    "/{assignment_id}",
    response_model=TeacherAssignmentResponse,
)
def get_teacher_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    assignment = db.get(
        TeacherAssignment,
        assignment_id,
    )

    if assignment is None:
        raise HTTPException(
            status_code=404,
            detail="Teacher assignment not found",
        )

    # Teacher can only view their own assignment
    if current_user.role.name == "TEACHER":
        teacher = db.scalar(
            select(Teacher).where(
                Teacher.user_id == current_user.id
            )
        )

        if teacher is None or assignment.teacher_id != teacher.id:
            raise HTTPException(
                status_code=403,
                detail="You can only access your own assignments",
            )

    return assignment


@router.put(
    "/{assignment_id}",
    response_model=TeacherAssignmentResponse,
)
def update_teacher_assignment(
    assignment_id: int,
    data: TeacherAssignmentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    assignment = db.get(
        TeacherAssignment,
        assignment_id,
    )

    if assignment is None:
        raise HTTPException(
            status_code=404,
            detail="Teacher assignment not found",
        )

    validate_assignment_data(data, db)

    existing = db.scalar(
        select(TeacherAssignment).where(
            TeacherAssignment.teacher_id == data.teacher_id,
            TeacherAssignment.class_id == data.class_id,
            TeacherAssignment.section_id == data.section_id,
            TeacherAssignment.subject_id == data.subject_id,
            TeacherAssignment.academic_year_id
            == data.academic_year_id,
            TeacherAssignment.id != assignment_id,
        )
    )

    if existing is not None:
        raise HTTPException(
            status_code=409,
            detail="Another identical teacher assignment already exists",
        )

    assignment.teacher_id = data.teacher_id
    assignment.class_id = data.class_id
    assignment.section_id = data.section_id
    assignment.subject_id = data.subject_id
    assignment.academic_year_id = data.academic_year_id

    db.commit()
    db.refresh(assignment)

    return assignment


@router.delete("/{assignment_id}")
def delete_teacher_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    assignment = db.get(
        TeacherAssignment,
        assignment_id,
    )

    if assignment is None:
        raise HTTPException(
            status_code=404,
            detail="Teacher assignment not found",
        )

    db.delete(assignment)

    try:
        db.commit()
    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail=(
                "Cannot delete this teacher assignment "
                "because it is connected to another record."
            ),
        )

    return {
        "message": "Teacher assignment deleted successfully",
        "assignment_id": assignment_id,
    }