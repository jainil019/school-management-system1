from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db

from app.models.student_fee import StudentFee
from app.models.student import Student
from app.models.fee_structure import FeeStructure
from app.models.parent import Parent
from app.models.parent_student_link import ParentStudentLink

from app.schemas.student_fee import (
    StudentFeeCreate,
    StudentFeeUpdate,
    StudentFeeResponse,
)


router = APIRouter(
    prefix="/student-fees",
    tags=["Student Fees"],
)


# ============================================================
# CREATE STUDENT FEE
# ============================================================

@router.post(
    "",
    response_model=StudentFeeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_student_fee(
    data: StudentFeeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "ACCOUNTANT",
        )
    ),
):
    # Check student
    student = db.get(Student, data.student_id)

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    # Check fee structure
    fee_structure = db.get(
        FeeStructure,
        data.fee_structure_id,
    )

    if fee_structure is None:
        raise HTTPException(
            status_code=404,
            detail="Fee structure not found",
        )

    # Check duplicate
    existing = (
        db.query(StudentFee)
        .filter(
            StudentFee.student_id == data.student_id,
            StudentFee.fee_structure_id
            == data.fee_structure_id,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="This fee is already assigned to the student",
        )

    student_fee = StudentFee(
        student_id=data.student_id,
        fee_structure_id=data.fee_structure_id,
        amount_due=fee_structure.amount,
        amount_paid=0,
        status="PENDING",
    )

    db.add(student_fee)
    db.commit()
    db.refresh(student_fee)

    return student_fee


# ============================================================
# GET ALL STUDENT FEES
# ============================================================

@router.get(
    "",
    response_model=list[StudentFeeResponse],
)
def get_student_fees(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "ACCOUNTANT",
        )
    ),
):
    return db.query(StudentFee).all()


# ============================================================
# PARENT - CHILD FEES
# ============================================================

@router.get(
    "/parent/{student_id}",
)
def get_child_fees(
    student_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("PARENT")
    ),
):
    # --------------------------------------------------------
    # Find parent profile
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
    # Verify parent-child relationship
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
                "this student's fees"
            ),
        )

    # --------------------------------------------------------
    # Check student
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
    # Get fees and fee structure
    # --------------------------------------------------------

    rows = (
        db.query(
            StudentFee,
            FeeStructure,
        )
        .join(
            FeeStructure,
            FeeStructure.id == StudentFee.fee_structure_id,
        )
        .filter(
            StudentFee.student_id == student_id,
        )
        .order_by(
            StudentFee.id.desc(),
        )
        .all()
    )

    # --------------------------------------------------------
    # Build response
    # --------------------------------------------------------

    result = []

    for student_fee, fee_structure in rows:
        amount_due = float(
            student_fee.amount_due
        )

        amount_paid = float(
            student_fee.amount_paid
        )

        amount_pending = max(
            amount_due - amount_paid,
            0,
        )

        result.append(
            {
                "student_fee_id": student_fee.id,
                "student_id": student_fee.student_id,
                "fee_structure_id": student_fee.fee_structure_id,

                "fee_type": fee_structure.fee_type,

                "amount_due": amount_due,
                "amount_paid": amount_paid,
                "amount_pending": amount_pending,

                "status": student_fee.status,

                "due_date": fee_structure.due_date,
                "created_at": student_fee.created_at,
            }
        )

    return result


# ============================================================
# GET SINGLE STUDENT FEE
# ============================================================

@router.get(
    "/{student_fee_id}",
    response_model=StudentFeeResponse,
)
def get_student_fee(
    student_fee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "ACCOUNTANT",
        )
    ),
):
    student_fee = db.get(
        StudentFee,
        student_fee_id,
    )

    if student_fee is None:
        raise HTTPException(
            status_code=404,
            detail="Student fee not found",
        )

    return student_fee


# ============================================================
# UPDATE STUDENT FEE
# ============================================================

@router.put(
    "/{student_fee_id}",
    response_model=StudentFeeResponse,
)
def update_student_fee(
    student_fee_id: int,
    data: StudentFeeUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "ACCOUNTANT",
        )
    ),
):
    student_fee = db.get(
        StudentFee,
        student_fee_id,
    )

    if student_fee is None:
        raise HTTPException(
            status_code=404,
            detail="Student fee not found",
        )

    allowed_statuses = {
        "PENDING",
        "PARTIAL",
        "PAID",
        "OVERDUE",
    }

    if data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid fee status",
        )

    student_fee.status = data.status

    db.commit()
    db.refresh(student_fee)

    return student_fee


# ============================================================
# DELETE STUDENT FEE
# ============================================================

@router.delete(
    "/{student_fee_id}"
)
def delete_student_fee(
    student_fee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN")
    ),
):
    student_fee = db.get(
        StudentFee,
        student_fee_id,
    )

    if student_fee is None:
        raise HTTPException(
            status_code=404,
            detail="Student fee not found",
        )

    db.delete(student_fee)
    db.commit()

    return {
        "message": "Student fee deleted successfully"
    }