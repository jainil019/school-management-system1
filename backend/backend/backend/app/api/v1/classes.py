from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db
from app.models.class_model import Class
from app.models.academic_year import AcademicYear
from app.schemas.class_schema import (
    ClassCreate,
    ClassUpdate,
    ClassResponse,
)


router = APIRouter(
    prefix="/classes",
    tags=["Classes"],
)


@router.post(
    "",
    response_model=ClassResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_class(
    data: ClassCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    academic_year = db.get(
        AcademicYear,
        data.academic_year_id,
    )

    if academic_year is None:
        raise HTTPException(
            status_code=404,
            detail="Academic year not found",
        )

    existing = db.scalar(
        select(Class).where(
            Class.name == data.name,
            Class.academic_year_id == data.academic_year_id,
        )
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="This class already exists for this academic year",
        )

    new_class = Class(
        name=data.name,
        academic_year_id=data.academic_year_id,
    )

    db.add(new_class)
    db.commit()
    db.refresh(new_class)

    return new_class


@router.get(
    "",
    response_model=list[ClassResponse],
)
def get_classes(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    return db.query(Class).order_by(Class.id.desc()).all()


@router.get(
    "/{class_id}",
    response_model=ClassResponse,
)
def get_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    class_data = db.get(Class, class_id)

    if class_data is None:
        raise HTTPException(
            status_code=404,
            detail="Class not found",
        )

    return class_data


@router.put(
    "/{class_id}",
    response_model=ClassResponse,
)
def update_class(
    class_id: int,
    data: ClassUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    class_data = db.get(Class, class_id)

    if class_data is None:
        raise HTTPException(
            status_code=404,
            detail="Class not found",
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

    existing = db.scalar(
        select(Class).where(
            Class.name == data.name,
            Class.academic_year_id == data.academic_year_id,
            Class.id != class_id,
        )
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="This class already exists for this academic year",
        )

    class_data.name = data.name
    class_data.academic_year_id = data.academic_year_id

    db.commit()
    db.refresh(class_data)

    return class_data

@router.delete("/{class_id}")
def delete_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN")
    ),
):
    class_data = db.get(Class, class_id)

    if class_data is None:
        raise HTTPException(
            status_code=404,
            detail="Class not found",
        )

    # Check whether this class has sections
    sections = getattr(class_data, "sections", [])

    if sections:
        section_names = ", ".join(
            section.name for section in sections
        )

        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot delete class '{class_data.name}' "
                f"because it has section(s): {section_names}. "
                "Delete the sections first."
            ),
        )

    db.delete(class_data)
    db.commit()

    return {
        "message": "Class deleted successfully",
        "class_id": class_id,
    }