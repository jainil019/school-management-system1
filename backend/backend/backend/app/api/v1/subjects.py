from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db
from app.models.subject import Subject
from app.schemas.subject import (
    SubjectCreate,
    SubjectUpdate,
    SubjectResponse,
)


router = APIRouter(
    prefix="/subjects",
    tags=["Subjects"],
)


@router.post(
    "",
    response_model=SubjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_subject(
    data: SubjectCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    subject = Subject(
        name=data.name,
        code=data.code,
    )

    db.add(subject)
    db.commit()
    db.refresh(subject)

    return subject


@router.get(
    "",
    response_model=list[SubjectResponse],
)
def get_subjects(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    return db.query(Subject).all()


@router.get(
    "/{subject_id}",
    response_model=SubjectResponse,
)
def get_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    subject = db.get(
        Subject,
        subject_id,
    )

    if subject is None:
        raise HTTPException(
            status_code=404,
            detail="Subject not found",
        )

    return subject


@router.put(
    "/{subject_id}",
    response_model=SubjectResponse,
)
def update_subject(
    subject_id: int,
    data: SubjectUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
        )
    ),
):
    subject = db.get(
        Subject,
        subject_id,
    )

    if subject is None:
        raise HTTPException(
            status_code=404,
            detail="Subject not found",
        )

    subject.name = data.name
    subject.code = data.code

    db.commit()
    db.refresh(subject)

    return subject


@router.delete(
    "/{subject_id}"
)
def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN")
    ),
):
    subject = db.get(
        Subject,
        subject_id,
    )

    if subject is None:
        raise HTTPException(
            status_code=404,
            detail="Subject not found",
        )

    db.delete(subject)
    db.commit()

    return {
        "message": "Subject deleted successfully",
        "subject_id": subject_id,
    }