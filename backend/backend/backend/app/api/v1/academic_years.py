from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db
from app.models.academic_year import AcademicYear
from app.schemas.academic_year import (
    AcademicYearCreate,
    AcademicYearResponse,
)


router = APIRouter(
    prefix="/academic-years",
    tags=["Academic Years"],
)


@router.post(
    "",
    response_model=AcademicYearResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_academic_year(
    data: AcademicYearCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    academic_year = AcademicYear(
        name=data.name,
        start_date=data.start_date,
        end_date=data.end_date,
        is_current=data.is_current,
    )

    db.add(academic_year)
    db.commit()
    db.refresh(academic_year)

    return academic_year


@router.get(
    "",
    response_model=list[AcademicYearResponse],
)
def get_academic_years(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    return db.query(AcademicYear).all()


@router.get(
    "/{academic_year_id}",
    response_model=AcademicYearResponse,
)
def get_academic_year(
    academic_year_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    academic_year = db.get(
        AcademicYear,
        academic_year_id,
    )

    if academic_year is None:
        raise HTTPException(
            status_code=404,
            detail="Academic year not found",
        )

    return academic_year