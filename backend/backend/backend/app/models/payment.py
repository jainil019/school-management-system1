from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)

    student_fee_id: Mapped[int] = mapped_column(
        ForeignKey("student_fees.id"),
        nullable=False,
    )

    amount: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    paid_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )

    method: Mapped[str] = mapped_column(
        nullable=False,
    )

    receipt_no: Mapped[str] = mapped_column(
        unique=True,
        nullable=False,
    )

    recorded_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )