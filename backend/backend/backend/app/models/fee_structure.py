from datetime import date

from sqlalchemy import Date, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class FeeStructure(Base):
    __tablename__ = "fee_structures"

    id: Mapped[int] = mapped_column(primary_key=True)

    academic_year_id: Mapped[int] = mapped_column(
        ForeignKey("academic_years.id"),
        nullable=False,
    )

    class_id: Mapped[int] = mapped_column(
        ForeignKey("classes.id"),
        nullable=False,
    )

    fee_type: Mapped[str] = mapped_column(
        nullable=False,
    )

    amount: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    due_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )