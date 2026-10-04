from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.class_model import Class


class Section(Base):
    __tablename__ = "sections"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    class_id: Mapped[int] = mapped_column(
        ForeignKey("classes.id"),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    class_: Mapped["Class"] = relationship(
        back_populates="sections"
    )