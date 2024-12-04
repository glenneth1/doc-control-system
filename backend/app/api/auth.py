from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..core.config import get_settings
from ..core.deps import get_db
from ..core.security import create_access_token
from ..schemas.token import Token
from ..services import user as user_service

settings = get_settings()
router = APIRouter()


@router.post("/login", response_model=Token)
def login(
    db: Annotated[Session, Depends(get_db)],
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Token:
    """OAuth2 compatible token login, get an access token for future requests."""
    print(f"Login attempt with username: {form_data.username}")
    user = user_service.authenticate(
        db, username=form_data.username, password=form_data.password
    )
    print(f"Authentication result: {'success' if user else 'failed'}")
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect username/email or password",
        )
    elif not user_service.is_active(user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = Token(
        access_token=create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        token_type="bearer",
    )
    print(f"Generated token for user: {user.username}")
    return token
