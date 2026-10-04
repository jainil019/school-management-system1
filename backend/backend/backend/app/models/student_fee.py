from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class StudentFee(Base):
    __tablename__ = "student_fees"

    id: Mapped[int] = mapped_column(primary_key=True)

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id"),
        nullable=False,
    )

    fee_structure_id: Mapped[int] = mapped_column(
        ForeignKey("fee_structures.id"),
        nullable=False,
    )

    amount_due: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    amount_paid: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=0,
    )

    status: Mapped[str] = mapped_column(
        nullable=False,
        default="PENDING",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )