from datetime import datetime

from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Announcement(Base):
    __tablename__ = "announcements"

    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str] = mapped_column(
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        nullable=False,
    )

    audience: Mapped[str] = mapped_column(
        nullable=False,
    )

    class_id: Mapped[int | None] = mapped_column(
        ForeignKey("classes.id"),
        nullable=True,
    )

    section_id: Mapped[int | None] = mapped_column(
        ForeignKey("sections.id"),
        nullable=True,
    )

    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )

    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )