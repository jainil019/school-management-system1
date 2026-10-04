from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db

from app.models.fee_structure import FeeStructure
from app.models.academic_year import AcademicYear
from app.models.class_model import Class

from app.schemas.fee_structure import (
    FeeStructureCreate,
    FeeStructureUpdate,
    FeeStructureResponse,
)


router = APIRouter(
    prefix="/fee-structures",
    tags=["Fee Structures"],
)


@router.post(
    "",
    response_model=FeeStructureResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_fee_structure(
    data: FeeStructureCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL", "ACCOUNTANT")
    ),
):
    # Check academic year
    academic_year = db.get(
        AcademicYear,
        data.academic_year_id,
    )

    if academic_year is None:
        raise HTTPException(
            status_code=404,
            detail="Academic year not found",
        )

    # Check class
    class_obj = db.get(
        Class,
        data.class_id,
    )

    if class_obj is None:
        raise HTTPException(
            status_code=404,
            detail="Class not found",
        )

    # Make sure class belongs to academic year
    if class_obj.academic_year_id != data.academic_year_id:
        raise HTTPException(
            status_code=400,
            detail="Class does not belong to this academic year",
        )

    # Validate amount
    if data.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Fee amount must be greater than 0",
        )

    # Check duplicate fee type
    existing = (
        db.query(FeeStructure)
        .filter(
            FeeStructure.academic_year_id
            == data.academic_year_id,
            FeeStructure.class_id == data.class_id,
            FeeStructure.fee_type == data.fee_type,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="This fee type already exists for this class",
        )

    fee_structure = FeeStructure(
        academic_year_id=data.academic_year_id,
        class_id=data.class_id,
        fee_type=data.fee_type,
        amount=data.amount,
        due_date=data.due_date,
    )

    db.add(fee_structure)
    db.commit()
    db.refresh(fee_structure)

    return fee_structure


@router.get(
    "",
    response_model=list[FeeStructureResponse],
)
def get_fee_structures(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "ACCOUNTANT",
        )
    ),
):
    return db.query(FeeStructure).all()


@router.get(
    "/{fee_structure_id}",
    response_model=FeeStructureResponse,
)
def get_fee_structure(
    fee_structure_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "ACCOUNTANT",
        )
    ),
):
    fee_structure = db.get(
        FeeStructure,
        fee_structure_id,
    )

    if fee_structure is None:
        raise HTTPException(
            status_code=404,
            detail="Fee structure not found",
        )

    return fee_structure


@router.put(
    "/{fee_structure_id}",
    response_model=FeeStructureResponse,
)
def update_fee_structure(
    fee_structure_id: int,
    data: FeeStructureUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "ACCOUNTANT",
        )
    ),
):
    fee_structure = db.get(
        FeeStructure,
        fee_structure_id,
    )

    if fee_structure is None:
        raise HTTPException(
            status_code=404,
            detail="Fee structure not found",
        )

    if data.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Fee amount must be greater than 0",
        )

    fee_structure.fee_type = data.fee_type
    fee_structure.amount = data.amount
    fee_structure.due_date = data.due_date

    db.commit()
    db.refresh(fee_structure)

    return fee_structure


@router.delete("/{fee_structure_id}")
def delete_fee_structure(
    fee_structure_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN")
    ),
):
    fee_structure = db.get(
        FeeStructure,
        fee_structure_id,
    )

    if fee_structure is None:
        raise HTTPException(
            status_code=404,
            detail="Fee structure not found",
        )

    db.delete(fee_structure)
    db.commit()

    return {
        "message": "Fee structure deleted successfully"
    }