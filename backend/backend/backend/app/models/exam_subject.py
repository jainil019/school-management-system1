from datetime import date

from sqlalchemy import Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ExamSubject(Base):
    __tablename__ = "exam_subjects"

    id: Mapped[int] = mapped_column(primary_key=True)

    examination_id: Mapped[int] = mapped_column(
        ForeignKey("examinations.id"),
        nullable=False,
    )

    class_id: Mapped[int] = mapped_column(
        ForeignKey("classes.id"),
        nullable=False,
    )

    subject_id: Mapped[int] = mapped_column(
        ForeignKey("subjects.id"),
        nullable=False,
    )

    max_marks: Mapped[int] = mapped_column(
        nullable=False,
    )

    passing_marks: Mapped[int] = mapped_column(
        nullable=False,
    )

    exam_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )