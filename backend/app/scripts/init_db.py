import os
import sys
from pathlib import Path

# Add the parent directory to the Python path
sys.path.append(str(Path(__file__).parent.parent.parent))

from sqlalchemy import create_engine
from app.core.config import get_settings
from app.models.models import Base

def init_db():
    settings = get_settings()
    engine = create_engine(settings.sync_database_url)
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()
