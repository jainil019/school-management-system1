from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db

from app.models.exam_subject import ExamSubject
from app.models.examination import Examination
from app.models.class_model import Class
from app.models.subject import Subject
from app.models.class_subject import ClassSubject

from app.schemas.exam_subject import (
    ExamSubjectCreate,
    ExamSubjectUpdate,
    ExamSubjectResponse,
)


router = APIRouter(
    prefix="/exam-subjects",
    tags=["Exam Subjects"],
)


@router.post(
    "",
    response_model=ExamSubjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_exam_subject(
    data: ExamSubjectCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("ADMIN", "PRINCIPAL")),
):
    # Check examination
    examination = db.get(Examination, data.examination_id)

    if examination is None:
        raise HTTPException(
            status_code=404,
            detail="Examination not found",
        )

    # Check class
    class_obj = db.get(Class, data.class_id)

    if class_obj is None:
        raise HTTPException(
            status_code=404,
            detail="Class not found",
        )

    # Check subject
    subject = db.get(Subject, data.subject_id)

    if subject is None:
        raise HTTPException(
            status_code=404,
            detail="Subject not found",
        )

    # Check subject is assigned to class
    class_subject = (
        db.query(ClassSubject)
        .filter(
            ClassSubject.class_id == data.class_id,
            ClassSubject.subject_id == data.subject_id,
        )
        .first()
    )

    if class_subject is None:
        raise HTTPException(
            status_code=400,
            detail="Subject is not assigned to this class",
        )

    # Validate marks
    if data.max_marks <= 0:
        raise HTTPException(
            status_code=400,
            detail="Maximum marks must be greater than 0",
        )

    if data.passing_marks < 0:
        raise HTTPException(
            status_code=400,
            detail="Passing marks cannot be negative",
        )

    if data.passing_marks > data.max_marks:
        raise HTTPException(
            status_code=400,
            detail="Passing marks cannot be greater than maximum marks",
        )

    # Check duplicate
    existing = (
        db.query(ExamSubject)
        .filter(
            ExamSubject.examination_id == data.examination_id,
            ExamSubject.class_id == data.class_id,
            ExamSubject.subject_id == data.subject_id,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="This subject is already added to this examination",
        )

    exam_subject = ExamSubject(
        examination_id=data.examination_id,
        class_id=data.class_id,
        subject_id=data.subject_id,
        max_marks=data.max_marks,
        passing_marks=data.passing_marks,
        exam_date=data.exam_date,
    )

    db.add(exam_subject)
    db.commit()
    db.refresh(exam_subject)

    return exam_subject


@router.get(
    "",
    response_model=list[ExamSubjectResponse],
)
def get_exam_subjects(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL", "TEACHER")
    ),
):
    return db.query(ExamSubject).all()


@router.get(
    "/{exam_subject_id}",
    response_model=ExamSubjectResponse,
)
def get_exam_subject(
    exam_subject_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL", "TEACHER")
    ),
):
    exam_subject = db.get(ExamSubject, exam_subject_id)

    if exam_subject is None:
        raise HTTPException(
            status_code=404,
            detail="Exam subject not found",
        )

    return exam_subject


@router.put(
    "/{exam_subject_id}",
    response_model=ExamSubjectResponse,
)
def update_exam_subject(
    exam_subject_id: int,
    data: ExamSubjectUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    exam_subject = db.get(ExamSubject, exam_subject_id)

    if exam_subject is None:
        raise HTTPException(
            status_code=404,
            detail="Exam subject not found",
        )

    if data.max_marks <= 0:
        raise HTTPException(
            status_code=400,
            detail="Maximum marks must be greater than 0",
        )

    if data.passing_marks < 0:
        raise HTTPException(
            status_code=400,
            detail="Passing marks cannot be negative",
        )

    if data.passing_marks > data.max_marks:
        raise HTTPException(
            status_code=400,
            detail="Passing marks cannot be greater than maximum marks",
        )

    exam_subject.max_marks = data.max_marks
    exam_subject.passing_marks = data.passing_marks
    exam_subject.exam_date = data.exam_date

    db.commit()
    db.refresh(exam_subject)

    return exam_subject


@router.delete("/{exam_subject_id}")
def delete_exam_subject(
    exam_subject_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("ADMIN")),
):
    exam_subject = db.get(ExamSubject, exam_subject_id)

    if exam_subject is None:
        raise HTTPException(
            status_code=404,
            detail="Exam subject not found",
        )

    db.delete(exam_subject)
    db.commit()

    return {
        "message": "Exam subject deleted successfully"
    }