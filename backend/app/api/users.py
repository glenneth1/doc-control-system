from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.deps import get_current_active_superuser, get_current_active_user, get_db
from ..models.models import User
from ..schemas.user import User as UserSchema, UserCreate, UserUpdate
from ..services import user as user_service

router = APIRouter()


@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: Annotated[User, Depends(get_current_active_user)]
) -> User:
    """Get current user."""
    return current_user


@router.put("/me", response_model=UserSchema)
def update_user_me(
    *,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    user_in: UserUpdate,
) -> User:
    """Update current user."""
    user = user_service.update_user(db, db_user=current_user, user_in=user_in)
    return user


@router.post("", response_model=UserSchema)
def create_user(
    *,
    db: Annotated[Session, Depends(get_db)],
    user_in: UserCreate,
    current_user: Annotated[User, Depends(get_current_active_superuser)],
) -> User:
    """Create new user. Only superusers can create new users."""
    user = user_service.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )
    user = user_service.create_user(db, user_in=user_in)
    return user


@router.get("", response_model=list[UserSchema])
def read_users(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_superuser)],
    skip: int = 0,
    limit: int = 100,
) -> list[User]:
    """Retrieve users. Only superusers can retrieve all users."""
    users = user_service.get_users(db, skip=skip, limit=limit)
    return users


@router.get("/{user_id}", response_model=UserSchema)
def read_user_by_id(
    user_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """Get a specific user by id."""
    user = user_service.get_user(db, user_id=user_id)
    if user == current_user:
        return user
    if not user_service.is_superuser(current_user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user doesn't have enough privileges",
        )
    return user
