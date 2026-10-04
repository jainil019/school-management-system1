from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Timetable(Base):
    __tablename__ = "timetables"

    id: Mapped[int] = mapped_column(primary_key=True)

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

    subject_id: Mapped[int] = mapped_column(
        ForeignKey("subjects.id"),
        nullable=False,
    )

    teacher_id: Mapped[int] = mapped_column(
        ForeignKey("teachers.id"),
        nullable=False,
    )

    day_of_week: Mapped[str] = mapped_column(
        nullable=False,
    )

    start_time: Mapped[str] = mapped_column(
        nullable=False,
    )

    end_time: Mapped[str] = mapped_column(
        nullable=False,
    )

    room: Mapped[str | None] = mapped_column(
        nullable=True,
    )