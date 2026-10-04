from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


if TYPE_CHECKING:
    from app.models.teacher import Teacher
    from app.models.class_model import Class
    from app.models.section import Section
    from app.models.subject import Subject
    from app.models.academic_year import AcademicYear


class TeacherAssignment(Base):
    __tablename__ = "teacher_assignments"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    teacher_id: Mapped[int] = mapped_column(
        ForeignKey("teachers.id"),
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

    subject_id: Mapped[int] = mapped_column(
        ForeignKey("subjects.id"),
        nullable=False,
    )

    academic_year_id: Mapped[int] = mapped_column(
        ForeignKey("academic_years.id"),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "teacher_id",
            "class_id",
            "section_id",
            "subject_id",
            "academic_year_id",
            name="uq_teacher_assignment",
        ),
    )