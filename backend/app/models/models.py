from sqlalchemy import Column, Integer, String, ForeignKey, Table, Boolean, Text, DateTime
from sqlalchemy.orm import relationship
from .base import BaseModel, Base
from datetime import datetime

# Association table for document tags
document_tags = Table(
    'document_tags',
    Base.metadata,
    Column('document_id', Integer, ForeignKey('documents.id')),
    Column('tag_id', Integer, ForeignKey('tags.id'))
)

class User(BaseModel):
    __tablename__ = "users"

    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    # Relationships
    documents = relationship("Document", back_populates="owner")

class Document(BaseModel):
    __tablename__ = "documents"

    title = Column(String, index=True)
    description = Column(Text)
    file_path = Column(String, nullable=False)
    mime_type = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    version = Column(Integer, default=1)
    
    # Relationships
    owner = relationship("User", back_populates="documents")
    tags = relationship("Tag", secondary=document_tags, back_populates="documents")
    versions = relationship("DocumentVersion", back_populates="document")
    current_checkout = relationship("DocumentCheckout", back_populates="document", uselist=False)
    activities = relationship("DocumentActivity", back_populates="document", order_by="desc(DocumentActivity.activity_time)")

class DocumentVersion(BaseModel):
    __tablename__ = "document_versions"

    document_id = Column(Integer, ForeignKey("documents.id"))
    version_number = Column(Integer)
    file_path = Column(String, nullable=False)
    changes = Column(Text)
    
    # Relationships
    document = relationship("Document", back_populates="versions")

class Tag(BaseModel):
    __tablename__ = "tags"

    name = Column(String, unique=True, index=True)
    
    # Relationships
    documents = relationship("Document", secondary=document_tags, back_populates="tags")

class DocumentCheckout(BaseModel):
    __tablename__ = "document_checkouts"

    document_id = Column(Integer, ForeignKey("documents.id"), unique=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    checkout_time = Column(DateTime, default=datetime.utcnow)
    comments = Column(Text)
    
    # Relationships
    document = relationship("Document", back_populates="current_checkout")
    user = relationship("User")

class DocumentActivity(BaseModel):
    __tablename__ = "document_activities"

    document_id = Column(Integer, ForeignKey("documents.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    activity_type = Column(String)  # e.g., "checkout", "checkin", "view"
    activity_time = Column(DateTime, default=datetime.utcnow)
    details = Column(Text)
    
    # Relationships
    document = relationship("Document", back_populates="activities")
    user = relationship("User")
