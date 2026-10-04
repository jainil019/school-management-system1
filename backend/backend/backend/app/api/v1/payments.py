from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db

from app.models.payment import Payment
from app.models.student_fee import StudentFee
from app.models.parent import Parent
from app.models.parent_student_link import ParentStudentLink

from app.schemas.payment import (
    PaymentCreate,
    PaymentResponse,
)


router = APIRouter(
    prefix="/payments",
    tags=["Payments"],
)


# ============================================================
# CREATE PAYMENT
# ============================================================

@router.post(
    "",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_payment(
    data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "ACCOUNTANT",
        )
    ),
):
    # Check student fee
    student_fee = db.get(
        StudentFee,
        data.student_fee_id,
    )

    if student_fee is None:
        raise HTTPException(
            status_code=404,
            detail="Student fee not found",
        )

    # Validate amount
    if data.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Payment amount must be greater than 0",
        )

    # Check remaining amount
    remaining_amount = (
        float(student_fee.amount_due)
        - float(student_fee.amount_paid)
    )

    if data.amount > remaining_amount:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Payment cannot be greater than "
                f"remaining amount {remaining_amount}"
            ),
        )

    # Check receipt number
    existing_receipt = (
        db.query(Payment)
        .filter(
            Payment.receipt_no == data.receipt_no
        )
        .first()
    )

    if existing_receipt:
        raise HTTPException(
            status_code=400,
            detail="Receipt number already exists",
        )

    payment = Payment(
        student_fee_id=data.student_fee_id,
        amount=data.amount,
        method=data.method,
        receipt_no=data.receipt_no,
        recorded_by=current_user.id,
    )

    db.add(payment)

    # Update paid amount
    student_fee.amount_paid = (
        float(student_fee.amount_paid)
        + data.amount
    )

    # Update status
    if student_fee.amount_paid >= student_fee.amount_due:
        student_fee.status = "PAID"
    else:
        student_fee.status = "PARTIAL"

    db.commit()
    db.refresh(payment)

    return payment


# ============================================================
# GET ALL PAYMENTS
# ============================================================

@router.get(
    "",
    response_model=list[PaymentResponse],
)
def get_payments(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "ACCOUNTANT",
        )
    ),
):
    return (
        db.query(Payment)
        .order_by(Payment.id.desc())
        .all()
    )


# ============================================================
# PARENT - CHILD PAYMENT HISTORY
# ============================================================

@router.get(
    "/parent/{student_id}",
)
def get_child_payments(
    student_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("PARENT")
    ),
):
    # --------------------------------------------------------
    # Find parent
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
                "this student's payments"
            ),
        )

    # --------------------------------------------------------
    # Check student
    # --------------------------------------------------------

    student = db.get(
        __import__(
            "app.models.student",
            fromlist=["Student"],
        ).Student,
        student_id,
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    # --------------------------------------------------------
    # Get payment history
    # --------------------------------------------------------

    rows = (
        db.query(
            Payment,
            StudentFee,
        )
        .join(
            StudentFee,
            StudentFee.id == Payment.student_fee_id,
        )
        .filter(
            StudentFee.student_id == student_id,
        )
        .order_by(
            Payment.paid_at.desc(),
            Payment.id.desc(),
        )
        .all()
    )

    result = []

    for payment, student_fee in rows:
        result.append(
            {
                "payment_id": payment.id,
                "student_fee_id": payment.student_fee_id,
                "amount": float(payment.amount),
                "paid_at": payment.paid_at,
                "method": payment.method,
                "receipt_no": payment.receipt_no,
            }
        )

    return result


# ============================================================
# GET SINGLE PAYMENT
# ============================================================

@router.get(
    "/{payment_id}",
    response_model=PaymentResponse,
)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "ACCOUNTANT",
        )
    ),
):
    payment = db.get(
        Payment,
        payment_id,
    )

    if payment is None:
        raise HTTPException(
            status_code=404,
            detail="Payment not found",
        )

    return payment


# ============================================================
# DELETE PAYMENT
# ============================================================

@router.delete(
    "/{payment_id}"
)
def delete_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN")
    ),
):
    payment = db.get(
        Payment,
        payment_id,
    )

    if payment is None:
        raise HTTPException(
            status_code=404,
            detail="Payment not found",
        )

    student_fee = db.get(
        StudentFee,
        payment.student_fee_id,
    )

    if student_fee:
        student_fee.amount_paid = max(
            0,
            float(student_fee.amount_paid)
            - float(payment.amount),
        )

        if student_fee.amount_paid == 0:
            student_fee.status = "PENDING"
        elif student_fee.amount_paid < student_fee.amount_due:
            student_fee.status = "PARTIAL"
        else:
            student_fee.status = "PAID"

    db.delete(payment)
    db.commit()

    return {
        "message": "Payment deleted successfully"
    }