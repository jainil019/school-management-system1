from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.class_model import Class


class AcademicYear(Base):
    __tablename__ = "academic_years"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    name: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False,
    )

    start_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    end_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    is_current: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    classes: Mapped[list["Class"]] = relationship(
        back_populates="academic_year"
    )