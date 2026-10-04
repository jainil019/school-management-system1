from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db

from app.models.examination import Examination
from app.models.exam_subject import ExamSubject
from app.models.student import Student
from app.models.student_enrollment import StudentEnrollment
from app.models.subject import Subject
from app.models.parent import Parent
from app.models.parent_student_link import ParentStudentLink

from app.schemas.examination import (
    ExaminationCreate,
    ExaminationUpdate,
    ExaminationResponse,
)


router = APIRouter(
    prefix="/examinations",
    tags=["Examinations"],
)


# ============================================================
# ADMIN / PRINCIPAL
# ============================================================

@router.post(
    "",
    response_model=ExaminationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_examination(
    data: ExaminationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    examination = Examination(
        name=data.name,
        academic_year_id=data.academic_year_id,
        start_date=data.start_date,
        end_date=data.end_date,
        status=data.status,
    )

    db.add(examination)
    db.commit()
    db.refresh(examination)

    return examination


@router.get(
    "",
    response_model=list[ExaminationResponse],
)
def get_examinations(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    return (
        db.query(Examination)
        .order_by(
            Examination.start_date.desc(),
            Examination.id.desc(),
        )
        .all()
    )


# ============================================================
# STUDENT - MY EXAMINATIONS
# ============================================================

@router.get(
    "/me",
)
def get_my_examinations(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("STUDENT")
    ),
):
    # --------------------------------------------------------
    # Find student profile linked to logged-in user
    # --------------------------------------------------------

    student = (
        db.query(Student)
        .filter(
            Student.user_id == current_user.id
        )
        .first()
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found for this account",
        )

    # --------------------------------------------------------
    # Find active enrollment
    # --------------------------------------------------------

    enrollment = (
        db.query(StudentEnrollment)
        .filter(
            StudentEnrollment.student_id == student.id,
            StudentEnrollment.status == "ACTIVE",
        )
        .order_by(
            StudentEnrollment.id.desc()
        )
        .first()
    )

    if enrollment is None:
        return []

    # --------------------------------------------------------
    # Find exam subjects for student's class
    # --------------------------------------------------------

    exam_subjects = (
        db.query(
            ExamSubject,
            Examination,
            Subject,
        )
        .join(
            Examination,
            Examination.id
            == ExamSubject.examination_id,
        )
        .join(
            Subject,
            Subject.id
            == ExamSubject.subject_id,
        )
        .filter(
            ExamSubject.class_id
            == enrollment.class_id,
        )
        .order_by(
            Examination.start_date.desc(),
            ExamSubject.exam_date.asc(),
            ExamSubject.id.asc(),
        )
        .all()
    )

    result = []

    for exam_subject, examination, subject in exam_subjects:
        result.append(
            {
                "exam_subject_id": exam_subject.id,
                "examination_id": examination.id,
                "examination_name": examination.name,
                "academic_year_id": examination.academic_year_id,
                "start_date": examination.start_date,
                "end_date": examination.end_date,
                "examination_status": examination.status,
                "subject_id": subject.id,
                "subject_name": subject.name,
                "max_marks": exam_subject.max_marks,
                "passing_marks": exam_subject.passing_marks,
                "exam_date": exam_subject.exam_date,
            }
        )

    return result


# ============================================================
# PARENT - CHILD EXAMINATIONS
# ============================================================

@router.get(
    "/parent/{student_id}",
)
def get_child_examinations(
    student_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("PARENT")
    ),
):
    """
    Return examinations for a child linked to the
    currently logged-in parent.
    """

    # --------------------------------------------------------
    # 1. Find parent profile
    # --------------------------------------------------------

    parent = (
        db.query(Parent)
        .filter(
            Parent.user_id == current_user.id
        )
        .first()
    )

    if parent is None:
        raise HTTPException(
            status_code=404,
            detail="Parent profile not found for this account",
        )

    # --------------------------------------------------------
    # 2. Verify parent-child relationship
    # --------------------------------------------------------

    link = (
        db.query(ParentStudentLink)
        .filter(
            ParentStudentLink.parent_id == parent.id,
            ParentStudentLink.student_id == student_id,
        )
        .first()
    )

    if link is None:
        raise HTTPException(
            status_code=403,
            detail=(
                "You are not authorized to view "
                "this student's examinations"
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

    enrollment = (
        db.query(StudentEnrollment)
        .filter(
            StudentEnrollment.student_id == student_id,
            StudentEnrollment.status == "ACTIVE",
        )
        .order_by(
            StudentEnrollment.id.desc()
        )
        .first()
    )

    if enrollment is None:
        return []

    # --------------------------------------------------------
    # 5. Find exam subjects for child's class
    # --------------------------------------------------------

    exam_subjects = (
        db.query(
            ExamSubject,
            Examination,
            Subject,
        )
        .join(
            Examination,
            Examination.id
            == ExamSubject.examination_id,
        )
        .join(
            Subject,
            Subject.id
            == ExamSubject.subject_id,
        )
        .filter(
            ExamSubject.class_id
            == enrollment.class_id,
        )
        .order_by(
            Examination.start_date.desc(),
            ExamSubject.exam_date.asc(),
            ExamSubject.id.asc(),
        )
        .all()
    )

    result = []

    for exam_subject, examination, subject in exam_subjects:
        result.append(
            {
                "exam_subject_id": exam_subject.id,
                "examination_id": examination.id,
                "examination_name": examination.name,
                "academic_year_id": examination.academic_year_id,
                "start_date": examination.start_date,
                "end_date": examination.end_date,
                "examination_status": examination.status,
                "subject_id": subject.id,
                "subject_name": subject.name,
                "max_marks": exam_subject.max_marks,
                "passing_marks": exam_subject.passing_marks,
                "exam_date": exam_subject.exam_date,
            }
        )

    return result


# ============================================================
# SINGLE EXAMINATION
# ============================================================

@router.get(
    "/{examination_id}",
    response_model=ExaminationResponse,
)
def get_examination(
    examination_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    examination = db.get(
        Examination,
        examination_id,
    )

    if examination is None:
        raise HTTPException(
            status_code=404,
            detail="Examination not found",
        )

    return examination


# ============================================================
# UPDATE
# ============================================================

@router.put(
    "/{examination_id}",
    response_model=ExaminationResponse,
)
def update_examination(
    examination_id: int,
    data: ExaminationUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
        )
    ),
):
    examination = db.get(
        Examination,
        examination_id,
    )

    if examination is None:
        raise HTTPException(
            status_code=404,
            detail="Examination not found",
        )

    examination.name = data.name
    examination.academic_year_id = data.academic_year_id
    examination.start_date = data.start_date
    examination.end_date = data.end_date
    examination.status = data.status

    db.commit()
    db.refresh(examination)

    return examination


# ============================================================
# DELETE
# ============================================================

@router.delete(
    "/{examination_id}"
)
def delete_examination(
    examination_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN")
    ),
):
    examination = db.get(
        Examination,
        examination_id,
    )

    if examination is None:
        raise HTTPException(
            status_code=404,
            detail="Examination not found",
        )

    db.delete(examination)
    db.commit()

    return {
        "message": "Examination deleted successfully"
    }