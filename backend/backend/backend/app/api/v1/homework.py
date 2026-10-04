from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db

from app.models.homework import Homework
from app.models.class_model import Class
from app.models.section import Section
from app.models.subject import Subject
from app.models.teacher import Teacher
from app.models.class_subject import ClassSubject
from app.models.student import Student
from app.models.student_enrollment import StudentEnrollment
from app.models.parent import Parent
from app.models.parent_student_link import ParentStudentLink

from app.schemas.homework import (
    HomeworkCreate,
    HomeworkUpdate,
    HomeworkResponse,
)

router = APIRouter(
    prefix="/homework",
    tags=["Homework"],
)


# ============================================================
# CREATE HOMEWORK
# ============================================================

@router.post(
    "",
    response_model=HomeworkResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_homework(
    data: HomeworkCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    # --------------------------------------------------------
    # Class
    # --------------------------------------------------------

    if db.get(Class, data.class_id) is None:
        raise HTTPException(
            status_code=404,
            detail="Class not found",
        )

    # --------------------------------------------------------
    # Section
    # --------------------------------------------------------

    if data.section_id is not None:
        section = db.get(
            Section,
            data.section_id,
        )

        if section is None:
            raise HTTPException(
                status_code=404,
                detail="Section not found",
            )

        if section.class_id != data.class_id:
            raise HTTPException(
                status_code=400,
                detail="Section does not belong to selected class",
            )

    # --------------------------------------------------------
    # Subject
    # --------------------------------------------------------

    if db.get(
        Subject,
        data.subject_id,
    ) is None:
        raise HTTPException(
            status_code=404,
            detail="Subject not found",
        )

    # --------------------------------------------------------
    # Teacher
    # --------------------------------------------------------

    if db.get(
        Teacher,
        data.teacher_id,
    ) is None:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found",
        )

    # --------------------------------------------------------
    # Subject must belong to class
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Date validation
    # --------------------------------------------------------

    if data.due_date < data.assigned_date:
        raise HTTPException(
            status_code=400,
            detail="Due date cannot be before assigned date",
        )

    # --------------------------------------------------------
    # Create homework
    # --------------------------------------------------------

    homework = Homework(
        class_id=data.class_id,
        section_id=data.section_id,
        subject_id=data.subject_id,
        teacher_id=data.teacher_id,
        title=data.title,
        description=data.description,
        assigned_date=data.assigned_date,
        due_date=data.due_date,
        attachment_url=data.attachment_url,
    )

    db.add(homework)
    db.commit()
    db.refresh(homework)

    return homework


# ============================================================
# GET ALL HOMEWORK
# ============================================================

@router.get(
    "",
    response_model=list[HomeworkResponse],
)
def get_homework(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
            "STUDENT",
            "PARENT",
        )
    ),
):
    statement = (
        select(Homework)
        .order_by(
            Homework.due_date.asc(),
            Homework.id.desc(),
        )
    )

    return db.scalars(statement).all()


# ============================================================
# STUDENT - MY HOMEWORK
# ============================================================

@router.get(
    "/me",
    response_model=list[HomeworkResponse],
)
def get_my_homework(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("STUDENT")
    ),
):
    """
    Return homework assigned to the logged-in student's
    enrolled class and section.
    """

    # --------------------------------------------------------
    # Find student profile
    # --------------------------------------------------------

    student = db.scalar(
        select(Student).where(
            Student.user_id == current_user.id
        )
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found for this account",
        )

    # --------------------------------------------------------
    # Find active enrollment
    # --------------------------------------------------------

    enrollment = db.scalar(
        select(StudentEnrollment)
        .where(
            StudentEnrollment.student_id == student.id,
            StudentEnrollment.status == "ACTIVE",
        )
        .order_by(
            StudentEnrollment.id.desc()
        )
    )

    if enrollment is None:
        return []

    # --------------------------------------------------------
    # Get homework for student's class and section
    #
    # Homework is visible when:
    # - class matches
    # - section matches
    # OR section_id is NULL (whole class)
    # --------------------------------------------------------

    statement = (
        select(Homework)
        .where(
            Homework.class_id == enrollment.class_id,
            (
                (Homework.section_id == enrollment.section_id)
                | (Homework.section_id.is_(None))
            ),
        )
        .order_by(
            Homework.due_date.asc(),
            Homework.id.desc(),
        )
    )

    return db.scalars(statement).all()


# ============================================================
# PARENT - CHILD HOMEWORK
# ============================================================

@router.get(
    "/parent/{student_id}",
    response_model=list[HomeworkResponse],
)
def get_child_homework(
    student_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("PARENT")
    ),
):
    """
    Return homework assigned to the selected child.

    Security:
    1. Find the logged-in parent's profile.
    2. Verify the child belongs to this parent.
    3. Find the child's active enrollment.
    4. Return homework for the child's class and section.
    """

    # --------------------------------------------------------
    # 1. Find parent profile
    # --------------------------------------------------------

    parent = db.scalar(
        select(Parent).where(
            Parent.user_id == current_user.id
        )
    )

    if parent is None:
        raise HTTPException(
            status_code=404,
            detail="Parent profile not found for this account",
        )

    # --------------------------------------------------------
    # 2. Verify parent-child relationship
    # --------------------------------------------------------

    link = db.scalar(
        select(ParentStudentLink).where(
            ParentStudentLink.parent_id == parent.id,
            ParentStudentLink.student_id == student_id,
        )
    )

    if link is None:
        raise HTTPException(
            status_code=403,
            detail=(
                "You are not authorized to view "
                "this student's homework"
            ),
        )

    # --------------------------------------------------------
    # 3. Verify student exists
    # --------------------------------------------------------

    student = db.get(
        Student,
        student_id,
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    # --------------------------------------------------------
    # 4. Find active enrollment
    # --------------------------------------------------------

    enrollment = db.scalar(
        select(StudentEnrollment)
        .where(
            StudentEnrollment.student_id == student_id,
            StudentEnrollment.status == "ACTIVE",
        )
        .order_by(
            StudentEnrollment.id.desc()
        )
    )

    if enrollment is None:
        return []

    # --------------------------------------------------------
    # 5. Get homework for child's class and section
    # --------------------------------------------------------

    statement = (
        select(Homework)
        .where(
            Homework.class_id == enrollment.class_id,
            (
                (Homework.section_id == enrollment.section_id)
                | (Homework.section_id.is_(None))
            ),
        )
        .order_by(
            Homework.due_date.asc(),
            Homework.id.desc(),
        )
    )

    return db.scalars(statement).all()


# ============================================================
# GET SINGLE HOMEWORK
# ============================================================

@router.get(
    "/{homework_id}",
    response_model=HomeworkResponse,
)
def get_homework_item(
    homework_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
            "STUDENT",
            "PARENT",
        )
    ),
):
    homework = db.get(
        Homework,
        homework_id,
    )

    if homework is None:
        raise HTTPException(
            status_code=404,
            detail="Homework not found",
        )

    return homework


# ============================================================
# UPDATE HOMEWORK
# ============================================================

@router.put(
    "/{homework_id}",
    response_model=HomeworkResponse,
)
def update_homework(
    homework_id: int,
    data: HomeworkUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    homework = db.get(
        Homework,
        homework_id,
    )

    if homework is None:
        raise HTTPException(
            status_code=404,
            detail="Homework not found",
        )

    if data.due_date < homework.assigned_date:
        raise HTTPException(
            status_code=400,
            detail="Due date cannot be before assigned date",
        )

    homework.title = data.title
    homework.description = data.description
    homework.due_date = data.due_date
    homework.attachment_url = data.attachment_url

    db.commit()
    db.refresh(homework)

    return homework


# ============================================================
# DELETE HOMEWORK
# ============================================================

@router.delete(
    "/{homework_id}"
)
def delete_homework(
    homework_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    homework = db.get(
        Homework,
        homework_id,
    )

    if homework is None:
        raise HTTPException(
            status_code=404,
            detail="Homework not found",
        )

    db.delete(homework)
    db.commit()

    return {
        "message": "Homework deleted successfully",
        "homework_id": homework_id,
    }