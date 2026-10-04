from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db
from app.models.user import User
from app.models.role import Role
from app.schemas.user import UserResponse


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get(
    "",
    response_model=list[UserResponse],
)
def get_users(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN")
    ),
):
    users = (
        db.query(User)
        .join(Role, User.role_id == Role.id)
        .order_by(User.id.asc())
        .all()
    )

    return [
        UserResponse(
            id=user.id,
            email=user.email,
            role_id=user.role_id,
            role_name=user.role.name,
            is_active=user.is_active,
        )
        for user in users
    ]


@router.patch(
    "/{user_id}/status",
    response_model=UserResponse,
)
def update_user_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN")
    ),
):
    user = db.get(User, user_id)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    # Prevent admin from accidentally disabling own account
    if user.id == current_user.id and not is_active:
        raise HTTPException(
            status_code=400,
            detail="You cannot deactivate your own account",
        )

    user.is_active = is_active

    db.commit()
    db.refresh(user)

    return UserResponse(
        id=user.id,
        email=user.email,
        role_id=user.role_id,
        role_name=user.role.name,
        is_active=user.is_active,
    )