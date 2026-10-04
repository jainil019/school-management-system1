from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db

from app.models.attendance import Attendance
from app.models.student import Student
from app.models.student_enrollment import StudentEnrollment
from app.models.teacher import Teacher
from app.models.teacher_assignment import TeacherAssignment
from app.models.parent import Parent
from app.models.parent_student_link import ParentStudentLink

from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceUpdate,
    AttendanceResponse,
)


router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"],
)


def get_current_teacher(
    current_user,
    db: Session,
):
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

    return teacher


def validate_teacher_can_mark(
    teacher: Teacher,
    enrollment: StudentEnrollment,
    db: Session,
):
    assignment = db.scalar(
        select(TeacherAssignment).where(
            TeacherAssignment.teacher_id == teacher.id,
            TeacherAssignment.class_id == enrollment.class_id,
            TeacherAssignment.section_id == enrollment.section_id,
            TeacherAssignment.academic_year_id
            == enrollment.academic_year_id,
        )
    )

    if assignment is None:
        raise HTTPException(
            status_code=403,
            detail=(
                "You are not assigned to this class and section "
                "for the selected academic year."
            ),
        )


# ============================================================
# CREATE ATTENDANCE
# ============================================================

@router.post(
    "",
    response_model=AttendanceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_attendance(
    data: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    # Student
    student = db.get(
        Student,
        data.student_id,
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    # Enrollment
    enrollment = db.get(
        StudentEnrollment,
        data.enrollment_id,
    )

    if enrollment is None:
        raise HTTPException(
            status_code=404,
            detail="Enrollment not found",
        )

    # Enrollment must belong to student
    if enrollment.student_id != data.student_id:
        raise HTTPException(
            status_code=400,
            detail="Enrollment does not belong to this student",
        )

    # Status
    if data.status not in [
        "PRESENT",
        "ABSENT",
        "LATE",
        "LEAVE",
    ]:
        raise HTTPException(
            status_code=400,
            detail="Invalid attendance status",
        )

    # Existing attendance
    existing = db.scalar(
        select(Attendance).where(
            Attendance.student_id == data.student_id,
            Attendance.date == data.date,
        )
    )

    if existing is not None:
        raise HTTPException(
            status_code=409,
            detail=(
                "Attendance already exists for this "
                "student on this date"
            ),
        )

    # ADMIN / PRINCIPAL can mark attendance.
    # TEACHER must mark only for an assigned class/section.
    if current_user.role.name == "TEACHER":
        teacher = get_current_teacher(
            current_user,
            db,
        )

        validate_teacher_can_mark(
            teacher,
            enrollment,
            db,
        )

        # Never trust marked_by from frontend.
        marked_by = teacher.id

    else:
        # ADMIN / PRINCIPAL
        # Keep supplied teacher ID for administrative entry.
        if db.get(Teacher, data.marked_by) is None:
            raise HTTPException(
                status_code=404,
                detail="Teacher not found",
            )

        marked_by = data.marked_by

    attendance = Attendance(
        student_id=data.student_id,
        enrollment_id=data.enrollment_id,
        date=data.date,
        status=data.status,
        marked_by=marked_by,
    )

    db.add(attendance)
    db.commit()
    db.refresh(attendance)

    return attendance


# ============================================================
# STUDENT - MY ATTENDANCE
# ============================================================

@router.get(
    "/me",
    response_model=list[AttendanceResponse],
)
def get_my_attendance(
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

    statement = (
        select(Attendance)
        .where(
            Attendance.student_id == student.id
        )
        .order_by(
            Attendance.date.desc(),
            Attendance.id.desc(),
        )
    )

    return db.scalars(statement).all()


# ============================================================
# PARENT - CHILD ATTENDANCE
# ============================================================

@router.get(
    "/parent/{student_id}",
    response_model=list[AttendanceResponse],
)
def get_child_attendance(
    student_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("PARENT")
    ),
):
    # --------------------------------------------------------
    # 1. Find the Parent profile for the logged-in account
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
    # 2. Verify that this child belongs to this parent
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
                "this student's attendance"
            ),
        )

    # --------------------------------------------------------
    # 3. Verify that the student exists
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
    # 4. Get attendance records for this child
    # --------------------------------------------------------

    statement = (
        select(Attendance)
        .where(
            Attendance.student_id == student_id
        )
        .order_by(
            Attendance.date.desc(),
            Attendance.id.desc(),
        )
    )

    return db.scalars(statement).all()


# ============================================================
# ADMIN / PRINCIPAL / TEACHER - ALL ATTENDANCE
# ============================================================

@router.get(
    "",
    response_model=list[AttendanceResponse],
)
def get_attendance(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    statement = select(Attendance)

    # Teacher sees only attendance records
    # marked by that teacher.
    if current_user.role.name == "TEACHER":
        teacher = get_current_teacher(
            current_user,
            db,
        )

        statement = statement.where(
            Attendance.marked_by == teacher.id
        )

    statement = statement.order_by(
        Attendance.date.desc(),
        Attendance.id.desc(),
    )

    return db.scalars(statement).all()


# ============================================================
# GET SINGLE ATTENDANCE RECORD
# ============================================================

@router.get(
    "/{attendance_id}",
    response_model=AttendanceResponse,
)
def get_attendance_record(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    attendance = db.get(
        Attendance,
        attendance_id,
    )

    if attendance is None:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found",
        )

    # Teacher can only access their own records.
    if current_user.role.name == "TEACHER":
        teacher = get_current_teacher(
            current_user,
            db,
        )

        if attendance.marked_by != teacher.id:
            raise HTTPException(
                status_code=403,
                detail="You can only access your own attendance records",
            )

    return attendance


# ============================================================
# UPDATE ATTENDANCE
# ============================================================

@router.put(
    "/{attendance_id}",
    response_model=AttendanceResponse,
)
def update_attendance(
    attendance_id: int,
    data: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    attendance = db.get(
        Attendance,
        attendance_id,
    )

    if attendance is None:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found",
        )

    if data.status not in [
        "PRESENT",
        "ABSENT",
        "LATE",
        "LEAVE",
    ]:
        raise HTTPException(
            status_code=400,
            detail="Invalid attendance status",
        )

    # Teacher can update only attendance
    # belonging to their own teacher account.
    if current_user.role.name == "TEACHER":
        teacher = get_current_teacher(
            current_user,
            db,
        )

        if attendance.marked_by != teacher.id:
            raise HTTPException(
                status_code=403,
                detail="You can only update your own attendance records",
            )

    attendance.status = data.status

    db.commit()
    db.refresh(attendance)

    return attendance


# ============================================================
# DELETE ATTENDANCE
# ============================================================

@router.delete(
    "/{attendance_id}"
)
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
        )
    ),
):
    attendance = db.get(
        Attendance,
        attendance_id,
    )

    if attendance is None:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found",
        )

    db.delete(attendance)
    db.commit()

    return {
        "message": "Attendance deleted successfully",
        "attendance_id": attendance_id,
    }