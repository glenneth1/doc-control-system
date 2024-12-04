import os
import sys
from pathlib import Path

# Add the parent directory to the Python path
sys.path.append(str(Path(__file__).parent.parent.parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from app.core.config import get_settings
from app.core.security import get_password_hash
from app.models.models import User

def create_admin_user(db: Session, username: str, password: str, email: str):
    # Check if admin user already exists
    user = db.query(User).filter(User.username == username).first()
    if user:
        print(f"User {username} already exists!")
        return user
    
    # Create new admin user
    hashed_password = get_password_hash(password)
    user = User(
        username=username,
        email=email,
        hashed_password=hashed_password,
        is_active=True,
        is_superuser=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"Admin user {username} created successfully!")
    return user

def main():
    settings = get_settings()
    engine = create_engine(settings.sync_database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    # Create admin user with default credentials
    create_admin_user(
        db=db,
        username="admin",
        password="admin123",  # Change this in production!
        email="admin@example.com"
    )

if __name__ == "__main__":
    main()
