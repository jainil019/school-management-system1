from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ParentStudentLink(Base):
    __tablename__ = "parent_student_links"

    id: Mapped[int] = mapped_column(primary_key=True)

    parent_id: Mapped[int] = mapped_column(
        ForeignKey("parents.id"),
        nullable=False,
    )

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id"),
        nullable=False,
    )

    relationship: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "parent_id",
            "student_id",
            name="uq_parent_student",
        ),
    )