from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db

from app.models.student import Student
from app.models.academic_year import AcademicYear
from app.models.class_model import Class
from app.models.section import Section
from app.models.student_enrollment import StudentEnrollment

from app.schemas.student_enrollment import (
    StudentEnrollmentCreate,
    StudentEnrollmentUpdate,
    StudentEnrollmentResponse,
)


router = APIRouter(
    prefix="/student-enrollments",
    tags=["Student Enrollments"],
)


def validate_enrollment(
    data,
    db: Session,
):
    student = db.get(Student, data.student_id)

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    academic_year = db.get(
        AcademicYear,
        data.academic_year_id,
    )

    if academic_year is None:
        raise HTTPException(
            status_code=404,
            detail="Academic year not found",
        )

    class_data = db.get(
        Class,
        data.class_id,
    )

    if class_data is None:
        raise HTTPException(
            status_code=404,
            detail="Class not found",
        )

    if class_data.academic_year_id != data.academic_year_id:
        raise HTTPException(
            status_code=400,
            detail="Class does not belong to selected academic year",
        )

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


@router.post(
    "",
    response_model=StudentEnrollmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_enrollment(
    data: StudentEnrollmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    validate_enrollment(data, db)

    existing = db.scalar(
        select(StudentEnrollment).where(
            StudentEnrollment.student_id == data.student_id,
            StudentEnrollment.academic_year_id
            == data.academic_year_id,
        )
    )

    if existing is not None:
        raise HTTPException(
            status_code=409,
            detail="This student is already enrolled for this academic year",
        )

    enrollment = StudentEnrollment(
        student_id=data.student_id,
        academic_year_id=data.academic_year_id,
        class_id=data.class_id,
        section_id=data.section_id,
        roll_no=data.roll_no,
        enrollment_date=data.enrollment_date,
        status=data.status,
    )

    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    return enrollment


# ---------------------------------------------------------
# STUDENT: MY ENROLLMENTS
# ---------------------------------------------------------

@router.get(
    "/me",
    response_model=list[StudentEnrollmentResponse],
)
def get_my_enrollments(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("STUDENT")
    ),
):
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

    enrollments = db.scalars(
        select(StudentEnrollment)
        .where(
            StudentEnrollment.student_id == student.id
        )
        .order_by(StudentEnrollment.id.desc())
    ).all()

    result = []

    for enrollment in enrollments:
        result.append(
            StudentEnrollmentResponse(
                id=enrollment.id,
                student_id=enrollment.student_id,
                academic_year_id=enrollment.academic_year_id,
                class_id=enrollment.class_id,
                section_id=enrollment.section_id,
                roll_no=enrollment.roll_no,
                enrollment_date=enrollment.enrollment_date,
                status=enrollment.status,
                academic_year_name=(
                    enrollment.academic_year.name
                    if enrollment.academic_year
                    else None
                ),
                class_name=(
                    enrollment.class_.name
                    if enrollment.class_
                    else None
                ),
                section_name=(
                    enrollment.section.name
                    if enrollment.section
                    else None
                ),
            )
        )

    return result
@router.get(
    "",
    response_model=list[StudentEnrollmentResponse],
)
def get_enrollments(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    statement = select(StudentEnrollment).order_by(
        StudentEnrollment.id.desc()
    )

    return db.scalars(statement).all()


@router.get(
    "/{enrollment_id}",
    response_model=StudentEnrollmentResponse,
)
def get_enrollment(
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    enrollment = db.get(
        StudentEnrollment,
        enrollment_id,
    )

    if enrollment is None:
        raise HTTPException(
            status_code=404,
            detail="Enrollment not found",
        )

    return enrollment


@router.put(
    "/{enrollment_id}",
    response_model=StudentEnrollmentResponse,
)
def update_enrollment(
    enrollment_id: int,
    data: StudentEnrollmentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    enrollment = db.get(
        StudentEnrollment,
        enrollment_id,
    )

    if enrollment is None:
        raise HTTPException(
            status_code=404,
            detail="Enrollment not found",
        )

    validate_enrollment(data, db)

    existing = db.scalar(
        select(StudentEnrollment).where(
            StudentEnrollment.student_id == data.student_id,
            StudentEnrollment.academic_year_id
            == data.academic_year_id,
            StudentEnrollment.id != enrollment_id,
        )
    )

    if existing is not None:
        raise HTTPException(
            status_code=409,
            detail="This student is already enrolled for this academic year",
        )

    enrollment.student_id = data.student_id
    enrollment.academic_year_id = data.academic_year_id
    enrollment.class_id = data.class_id
    enrollment.section_id = data.section_id
    enrollment.roll_no = data.roll_no
    enrollment.enrollment_date = data.enrollment_date
    enrollment.status = data.status

    db.commit()
    db.refresh(enrollment)

    return enrollment


@router.delete("/{enrollment_id}")
def delete_enrollment(
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN")
    ),
):
    enrollment = db.get(
        StudentEnrollment,
        enrollment_id,
    )

    if enrollment is None:
        raise HTTPException(
            status_code=404,
            detail="Enrollment not found",
        )

    enrollment_id_value = enrollment.id

    try:
        db.delete(enrollment)
        db.commit()

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail=(
                "Cannot delete this enrollment because "
                "it is connected to attendance or another record. "
                "Remove those records first."
            ),
        )

    return {
        "message": "Enrollment deleted successfully",
        "enrollment_id": enrollment_id_value,
    }