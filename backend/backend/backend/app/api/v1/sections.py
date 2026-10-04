from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db
from app.models.section import Section
from app.models.class_model import Class
from app.schemas.section import (
    SectionCreate,
    SectionUpdate,
    SectionResponse,
)


router = APIRouter(
    prefix="/sections",
    tags=["Sections"],
)


@router.post(
    "",
    response_model=SectionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_section(
    data: SectionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    class_data = db.get(
        Class,
        data.class_id,
    )

    if class_data is None:
        raise HTTPException(
            status_code=404,
            detail="Class not found",
        )

    existing = db.scalar(
        select(Section).where(
            Section.name == data.name,
            Section.class_id == data.class_id,
        )
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="This section already exists for this class",
        )

    section = Section(
        name=data.name,
        class_id=data.class_id,
    )

    db.add(section)
    db.commit()
    db.refresh(section)

    return section


@router.get(
    "",
    response_model=list[SectionResponse],
)
def get_sections(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    return db.query(Section).order_by(Section.id.desc()).all()


@router.get(
    "/{section_id}",
    response_model=SectionResponse,
)
def get_section(
    section_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    section = db.get(
        Section,
        section_id,
    )

    if section is None:
        raise HTTPException(
            status_code=404,
            detail="Section not found",
        )

    return section


@router.put(
    "/{section_id}",
    response_model=SectionResponse,
)
def update_section(
    section_id: int,
    data: SectionUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    section = db.get(
        Section,
        section_id,
    )

    if section is None:
        raise HTTPException(
            status_code=404,
            detail="Section not found",
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

    existing = db.scalar(
        select(Section).where(
            Section.name == data.name,
            Section.class_id == data.class_id,
            Section.id != section_id,
        )
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="This section already exists for this class",
        )

    section.name = data.name
    section.class_id = data.class_id

    db.commit()
    db.refresh(section)

    return section


@router.delete("/{section_id}")
def delete_section(
    section_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN")
    ),
):
    section = db.get(
        Section,
        section_id,
    )

    if section is None:
        raise HTTPException(
            status_code=404,
            detail="Section not found",
        )

    db.delete(section)

    try:
        db.commit()
    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot delete section '{section.name}' "
                "because it is connected to other records. "
                "Remove those records first."
            ),
        )

    return {
        "message": "Section deleted successfully",
        "section_id": section_id,
    }