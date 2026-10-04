from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class HomeworkSubmission(Base):
    __tablename__ = "homework_submissions"

    id: Mapped[int] = mapped_column(primary_key=True)

    homework_id: Mapped[int] = mapped_column(
        ForeignKey("homework.id"),
        nullable=False,
    )

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id"),
        nullable=False,
    )

    submitted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    file_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="SUBMITTED",
        nullable=False,
    )

    feedback: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    reviewed_by: Mapped[int | None] = mapped_column(
        ForeignKey("teachers.id"),
        nullable=True,
    )

    __table_args__ = (
        UniqueConstraint(
            "homework_id",
            "student_id",
            name="uq_homework_student_submission",
        ),
    )