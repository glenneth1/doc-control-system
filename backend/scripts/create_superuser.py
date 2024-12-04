from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.models import User

def create_superuser():
    db = SessionLocal()
    try:
        # Check if superuser already exists
        superuser = db.query(User).filter(User.email == "admin@example.com").first()
        if not superuser:
            superuser = User(
                email="admin@example.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Admin User",
                is_superuser=True,
                is_active=True
            )
            db.add(superuser)
            db.commit()
            db.refresh(superuser)
            print("Superuser created successfully!")
        else:
            print("Superuser already exists!")
    finally:
        db.close()

if __name__ == "__main__":
    create_superuser()
