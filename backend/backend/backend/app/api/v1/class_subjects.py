from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db
from app.models.class_subject import ClassSubject
from app.models.class_model import Class
from app.models.subject import Subject
from app.schemas.class_subject import (
    ClassSubjectCreate,
    ClassSubjectResponse,
)

router = APIRouter(
    prefix="/class-subjects",
    tags=["Class Subjects"],
)


@router.post(
    "",
    response_model=ClassSubjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_class_subject(
    data: ClassSubjectCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    # Check class exists
    class_obj = db.get(Class, data.class_id)

    if class_obj is None:
        raise HTTPException(
            status_code=404,
            detail="Class not found",
        )

    # Check subject exists
    subject = db.get(Subject, data.subject_id)

    if subject is None:
        raise HTTPException(
            status_code=404,
            detail="Subject not found",
        )

    # Check duplicate assignment
    existing = db.scalar(
        select(ClassSubject).where(
            ClassSubject.class_id == data.class_id,
            ClassSubject.subject_id == data.subject_id,
        )
    )

    if existing is not None:
        raise HTTPException(
            status_code=400,
            detail="Subject is already assigned to this class",
        )

    class_subject = ClassSubject(
        class_id=data.class_id,
        subject_id=data.subject_id,
    )

    db.add(class_subject)
    db.commit()
    db.refresh(class_subject)

    return class_subject


@router.get(
    "",
    response_model=list[ClassSubjectResponse],
)
def get_class_subjects(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    statement = select(ClassSubject)

    return db.scalars(statement).all()


@router.get(
    "/{class_subject_id}",
    response_model=ClassSubjectResponse,
)
def get_class_subject(
    class_subject_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    class_subject = db.get(
        ClassSubject,
        class_subject_id,
    )

    if class_subject is None:
        raise HTTPException(
            status_code=404,
            detail="Class-subject assignment not found",
        )

    return class_subject


@router.delete(
    "/{class_subject_id}"
)
def delete_class_subject(
    class_subject_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN")
    ),
):
    class_subject = db.get(
        ClassSubject,
        class_subject_id,
    )

    if class_subject is None:
        raise HTTPException(
            status_code=404,
            detail="Class-subject assignment not found",
        )

    db.delete(class_subject)
    db.commit()

    return {
        "message": "Subject removed from class successfully",
        "class_subject_id": class_subject_id,
    }