from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db
from app.models.parent import Parent
from app.models.student import Student
from app.models.parent_student_link import ParentStudentLink
from app.schemas.parent_student_link import (
    ParentStudentLinkCreate,
    ParentStudentLinkResponse,
    ParentChildResponse,
)

router = APIRouter(
    prefix="/parent-student-links",
    tags=["Parent Student Links"],
)


@router.post(
    "",
    response_model=ParentStudentLinkResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_link(
    data: ParentStudentLinkCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    if db.get(Parent, data.parent_id) is None:
        raise HTTPException(
            status_code=404,
            detail="Parent not found",
        )

    if db.get(Student, data.student_id) is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    existing = db.scalar(
        select(ParentStudentLink).where(
            ParentStudentLink.parent_id == data.parent_id,
            ParentStudentLink.student_id == data.student_id,
        )
    )

    if existing is not None:
        raise HTTPException(
            status_code=400,
            detail="Parent is already linked to this student",
        )

    link = ParentStudentLink(
        parent_id=data.parent_id,
        student_id=data.student_id,
        relationship=data.relationship,
    )

    db.add(link)
    db.commit()
    db.refresh(link)

    return link


@router.get(
    "",
    response_model=list[ParentStudentLinkResponse],
)
def get_links(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
        )
    ),
):
    statement = select(ParentStudentLink)

    return db.scalars(statement).all()


@router.get(
    "/me",
    response_model=list[ParentChildResponse],
)
def get_my_children(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("PARENT")
    ),
):
    """
    Return only the students linked to the currently
    authenticated parent account.
    """

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

    statement = (
        select(
            ParentStudentLink.id.label("link_id"),
            ParentStudentLink.relationship,
            Student.id.label("student_id"),
            Student.admission_no,
            Student.first_name,
            Student.last_name,
            Student.dob,
            Student.gender,
            Student.phone,
            Student.address,
            Student.admission_date,
            Student.photo_url,
            Student.status,
        )
        .join(
            Student,
            Student.id == ParentStudentLink.student_id,
        )
        .where(
            ParentStudentLink.parent_id == parent.id
        )
        .order_by(
            Student.first_name.asc(),
            Student.last_name.asc(),
            Student.id.asc(),
        )
    )

    rows = db.execute(statement).all()

    return [
        ParentChildResponse(
            link_id=row.link_id,
            student_id=row.student_id,
            relationship=row.relationship,
            admission_no=row.admission_no,
            first_name=row.first_name,
            last_name=row.last_name,
            dob=row.dob,
            gender=row.gender,
            phone=row.phone,
            address=row.address,
            admission_date=row.admission_date,
            photo_url=row.photo_url,
            status=row.status,
        )
        for row in rows
    ]


@router.get(
    "/{link_id}",
    response_model=ParentStudentLinkResponse,
)
def get_link(
    link_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "PARENT",
        )
    ),
):
    link = db.get(ParentStudentLink, link_id)

    if link is None:
        raise HTTPException(
            status_code=404,
            detail="Parent-student link not found",
        )

    return link


@router.delete("/{link_id}")
def delete_link(
    link_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    link = db.get(ParentStudentLink, link_id)

    if link is None:
        raise HTTPException(
            status_code=404,
            detail="Parent-student link not found",
        )

    db.delete(link)
    db.commit()

    return {
        "message": "Parent-student link deleted successfully",
        "link_id": link_id,
    }