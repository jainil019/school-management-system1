from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.core.security import hash_password
from app.db.session import get_db

from app.models.student import Student
from app.models.user import User
from app.models.role import Role
from app.models.attendance import Attendance
from app.models.homework_submission import HomeworkSubmission
from app.models.mark import Mark
from app.models.parent_student_link import ParentStudentLink
from app.models.student_enrollment import StudentEnrollment
from app.models.student_fee import StudentFee

from app.schemas.student import (
    StudentCreate,
    StudentUpdate,
    StudentResponse,
    StudentAccountCreate,
)


router = APIRouter(
    prefix="/students",
    tags=["Students"],
)


def _role(db: Session, name: str):
    role = db.scalar(
        select(Role).where(Role.name == name)
    )

    if role is None:
        raise HTTPException(
            status_code=500,
            detail=f"{name} role is not configured",
        )

    return role


# ============================================================
# STUDENT SELF PROFILE
# ============================================================

@router.get(
    "/me",
    response_model=StudentResponse,
)
def get_my_student_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(
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

    return student


# ============================================================
# CREATE STUDENT ACCOUNT
# ============================================================

@router.post(
    "/create-account",
    response_model=StudentResponse,
    status_code=201,
)
def create_student_account(
    data: StudentAccountCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    email = data.email.strip().lower()

    if db.scalar(
        select(User).where(User.email == email)
    ):
        raise HTTPException(
            status_code=409,
            detail="Email address is already registered",
        )

    role = _role(db, "STUDENT")

    user = User(
        email=email,
        password_hash=hash_password(data.password),
        role_id=role.id,
        is_active=True,
    )

    db.add(user)
    db.flush()

    if db.scalar(
        select(Student).where(
            Student.admission_no == data.admission_no
        )
    ):
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="Admission number already exists",
        )

    student = Student(
        user_id=user.id,
        admission_no=data.admission_no,
        first_name=data.first_name,
        last_name=data.last_name,
        dob=data.dob,
        gender=data.gender,
        phone=data.phone,
        address=data.address,
        admission_date=data.admission_date,
        photo_url=data.photo_url,
        status=data.status,
    )

    db.add(student)

    try:
        db.commit()
        db.refresh(student)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Unable to create student. Check the submitted details.",
        )

    return student


# ============================================================
# CREATE STUDENT
# ============================================================

@router.post(
    "",
    response_model=StudentResponse,
    status_code=201,
)
def create_student(
    data: StudentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    user = db.get(
        User,
        data.user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    if user.role.name != "STUDENT":
        raise HTTPException(
            status_code=400,
            detail="User must have STUDENT role",
        )

    if db.scalar(
        select(Student).where(
            Student.user_id == data.user_id
        )
    ):
        raise HTTPException(
            status_code=409,
            detail="Student profile already exists for this user",
        )

    if db.scalar(
        select(Student).where(
            Student.admission_no == data.admission_no
        )
    ):
        raise HTTPException(
            status_code=409,
            detail="Admission number already exists",
        )

    student = Student(
        **data.model_dump()
    )

    db.add(student)
    db.commit()
    db.refresh(student)

    return student


# ============================================================
# GET ALL STUDENTS
# ============================================================

@router.get(
    "",
    response_model=list[StudentResponse],
)
def get_students(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    return db.scalars(
        select(Student).order_by(
            Student.id.desc()
        )
    ).all()


# ============================================================
# GET STUDENT BY ID
# ============================================================

@router.get(
    "/{student_id}",
    response_model=StudentResponse,
)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    student = db.get(
        Student,
        student_id,
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    return student


# ============================================================
# UPDATE STUDENT
# ============================================================

@router.put(
    "/{student_id}",
    response_model=StudentResponse,
)
def update_student(
    student_id: int,
    data: StudentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
        )
    ),
):
    student = db.get(
        Student,
        student_id,
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    duplicate = db.scalar(
        select(Student).where(
            Student.admission_no == data.admission_no,
            Student.id != student_id,
        )
    )

    if duplicate:
        raise HTTPException(
            status_code=409,
            detail="Admission number already exists",
        )

    for key, value in data.model_dump().items():
        setattr(
            student,
            key,
            value,
        )

    db.commit()
    db.refresh(student)

    return student


# ============================================================
# DELETE STUDENT
# ============================================================

@router.delete(
    "/{student_id}"
)
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN")
    ),
):
    student = db.get(
        Student,
        student_id,
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    user_id = student.user_id

    db.execute(
        delete(Attendance).where(
            Attendance.student_id == student_id
        )
    )

    db.execute(
        delete(HomeworkSubmission).where(
            HomeworkSubmission.student_id == student_id
        )
    )

    db.execute(
        delete(Mark).where(
            Mark.student_id == student_id
        )
    )

    db.execute(
        delete(ParentStudentLink).where(
            ParentStudentLink.student_id == student_id
        )
    )

    db.execute(
        delete(StudentEnrollment).where(
            StudentEnrollment.student_id == student_id
        )
    )

    db.execute(
        delete(StudentFee).where(
            StudentFee.student_id == student_id
        )
    )

    db.delete(student)
    db.flush()

    user = db.get(
        User,
        user_id,
    )

    if user is not None:
        user.is_active = False

    db.commit()

    return {
        "message": "Student deleted successfully",
        "student_id": student_id,
    }