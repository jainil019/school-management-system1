from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.core.security import hash_password
from app.db.session import get_db
from app.models.parent import Parent
from app.models.role import Role
from app.models.user import User
from app.schemas.parent import (
    ParentCreate,
    ParentUpdate,
    ParentResponse,
    ParentAccountCreate,
    ParentProfileResponse,
)


router = APIRouter(
    prefix="/parents",
    tags=["Parents"],
)


@router.post(
    "/create-account",
    response_model=ParentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_parent_account(
    data: ParentAccountCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    email = data.email.strip().lower()

    existing_user = db.scalar(
        select(User).where(User.email == email)
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email address is already registered",
        )

    role = db.scalar(
        select(Role).where(Role.name == "PARENT")
    )

    if role is None:
        raise HTTPException(
            status_code=500,
            detail="PARENT role is not configured",
        )

    user = User(
        email=email,
        password_hash=hash_password(data.password),
        role_id=role.id,
        is_active=True,
    )

    db.add(user)
    db.flush()

    parent = Parent(
        user_id=user.id,
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone,
        address=data.address,
    )

    db.add(parent)

    try:
        db.commit()
        db.refresh(parent)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Unable to create parent",
        )

    return parent


@router.post(
    "",
    response_model=ParentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_parent(
    data: ParentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    user = db.get(User, data.user_id)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    role = db.get(Role, user.role_id)

    if role is None or role.name != "PARENT":
        raise HTTPException(
            status_code=400,
            detail="Selected user does not have PARENT role",
        )

    existing = db.scalar(
        select(Parent).where(
            Parent.user_id == data.user_id
        )
    )

    if existing is not None:
        raise HTTPException(
            status_code=400,
            detail="Parent profile already exists for this user",
        )

    parent = Parent(
        user_id=data.user_id,
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone,
        address=data.address,
    )

    db.add(parent)
    db.commit()
    db.refresh(parent)

    return parent


@router.get(
    "",
    response_model=list[ParentResponse],
)
def get_parents(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    statement = select(Parent)

    return db.scalars(statement).all()


# ============================================================
# CURRENT LOGGED-IN PARENT PROFILE
# ============================================================

@router.get(
    "/me",
    response_model=ParentProfileResponse,
)
def get_my_parent_profile(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("PARENT")
    ),
):
    parent = db.scalar(
        select(Parent).where(
            Parent.user_id == current_user.id
        )
    )

    if parent is None:
        raise HTTPException(
            status_code=404,
            detail="Parent profile not found for this account",
        )

    return {
        "id": parent.id,
        "user_id": parent.user_id,
        "first_name": parent.first_name,
        "last_name": parent.last_name,
        "phone": parent.phone,
        "address": parent.address,
        "email": current_user.email,
        "is_active": current_user.is_active,
        "created_at": parent.created_at,
        "updated_at": parent.updated_at,
    }


@router.get(
    "/{parent_id}",
    response_model=ParentResponse,
)
def get_parent(
    parent_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "PARENT",
        )
    ),
):
    parent = db.get(Parent, parent_id)

    if parent is None:
        raise HTTPException(
            status_code=404,
            detail="Parent not found",
        )

    return parent


@router.put(
    "/{parent_id}",
    response_model=ParentResponse,
)
def update_parent(
    parent_id: int,
    data: ParentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    parent = db.get(Parent, parent_id)

    if parent is None:
        raise HTTPException(
            status_code=404,
            detail="Parent not found",
        )

    parent.first_name = data.first_name
    parent.last_name = data.last_name
    parent.phone = data.phone
    parent.address = data.address

    db.commit()
    db.refresh(parent)

    return parent


@router.delete(
    "/{parent_id}"
)
def delete_parent(
    parent_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN")
    ),
):
    parent = db.get(Parent, parent_id)

    if parent is None:
        raise HTTPException(
            status_code=404,
            detail="Parent not found",
        )

    user_id = parent.user_id

    db.delete(parent)
    db.flush()

    user = db.get(User, user_id)

    if user is not None:
        user.is_active = False

    db.commit()

    return {
        "message": "Parent deleted successfully",
        "parent_id": parent_id,
    }   