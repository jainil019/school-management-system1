from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ClassSubject(Base):
    __tablename__ = "class_subjects"

    id: Mapped[int] = mapped_column(primary_key=True)

    class_id: Mapped[int] = mapped_column(
        ForeignKey("classes.id"),
        nullable=False,
    )

    subject_id: Mapped[int] = mapped_column(
        ForeignKey("subjects.id"),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "class_id",
            "subject_id",
            name="uq_class_subject",
        ),
    )