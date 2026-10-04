from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db

from app.models.notification import Notification
from app.models.user import User

from app.schemas.notification import (
    NotificationCreate,
    NotificationResponse,
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


@router.post(
    "",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_notification(
    data: NotificationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    user = db.get(User, data.user_id)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    notification = Notification(
        user_id=data.user_id,
        type=data.type,
        title=data.title,
        message=data.message,
        is_read=False,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


@router.get(
    "/me",
    response_model=list[NotificationResponse],
)
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
            "STUDENT",
            "PARENT",
            "ACCOUNTANT",
        )
    ),
):
    return (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id
        )
        .order_by(Notification.created_at.desc())
        .all()
    )


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
            "STUDENT",
            "PARENT",
            "ACCOUNTANT",
        )
    ),
):
    notification = db.get(
        Notification,
        notification_id,
    )

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot modify this notification",
        )

    notification.is_read = True
    notification.read_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(notification)

    return notification


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
        )
    ),
):
    notification = db.get(
        Notification,
        notification_id,
    )

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    db.delete(notification)
    db.commit()

    return {
        "message": "Notification deleted successfully"
    }