from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.academic_year import AcademicYear
    from app.models.section import Section


class Class(Base):
    __tablename__ = "classes"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    name: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    academic_year_id: Mapped[int] = mapped_column(
        ForeignKey("academic_years.id"),
        nullable=False,
    )

    academic_year: Mapped["AcademicYear"] = relationship(
        back_populates="classes"
    )

    sections: Mapped[list["Section"]] = relationship(
        back_populates="class_"
    )