from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


if TYPE_CHECKING:
    from app.models.student import Student
    from app.models.academic_year import AcademicYear
    from app.models.class_model import Class
    from app.models.section import Section


class StudentEnrollment(Base):
    __tablename__ = "student_enrollments"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id"),
        nullable=False,
    )

    academic_year_id: Mapped[int] = mapped_column(
        ForeignKey("academic_years.id"),
        nullable=False,
    )

    class_id: Mapped[int] = mapped_column(
        ForeignKey("classes.id"),
        nullable=False,
    )

    section_id: Mapped[int] = mapped_column(
        ForeignKey("sections.id"),
        nullable=False,
    )

    roll_no: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    enrollment_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="ACTIVE",
        nullable=False,
    )

    student: Mapped["Student"] = relationship()

    academic_year: Mapped["AcademicYear"] = relationship()

    class_: Mapped["Class"] = relationship()

    section: Mapped["Section"] = relationship()