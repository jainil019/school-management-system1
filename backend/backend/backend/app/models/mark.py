from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Mark(Base):
    __tablename__ = "marks"

    id: Mapped[int] = mapped_column(primary_key=True)

    exam_subject_id: Mapped[int] = mapped_column(
        ForeignKey("exam_subjects.id"),
        nullable=False,
    )

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id"),
        nullable=False,
    )

    marks_obtained: Mapped[int] = mapped_column(
        nullable=False,
    )

    grade: Mapped[str | None] = mapped_column(
        nullable=True,
    )

    remarks: Mapped[str | None] = mapped_column(
        nullable=True,
    )

    __table_args__ = (
        UniqueConstraint(
            "exam_subject_id",
            "student_id",
            name="uq_marks_exam_subject_student",
        ),
    )