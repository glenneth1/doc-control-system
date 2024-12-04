import os
from datetime import datetime
from typing import Optional
from fastapi import UploadFile
from sqlalchemy.orm import Session
from ..models.models import Document, DocumentVersion, Tag, DocumentCheckout, DocumentActivity
from ..schemas.document import DocumentCreate, DocumentUpdate


def get_document(db: Session, document_id: int) -> Optional[Document]:
    document = db.query(Document).filter(Document.id == document_id).first()
    print(f"Fetching document {document_id}: {'Found' if document else 'Not found'}")
    return document


def get_documents(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    owner_id: Optional[int] = None
) -> list[Document]:
    query = db.query(Document)
    if owner_id is not None:
        query = query.filter(Document.owner_id == owner_id)
    return query.offset(skip).limit(limit).all()


def get_or_create_tag(db: Session, tag_name: str) -> Tag:
    tag = db.query(Tag).filter(Tag.name == tag_name).first()
    if not tag:
        tag = Tag(name=tag_name)
        db.add(tag)
        db.commit()
        db.refresh(tag)
    return tag


async def create_document(
    db: Session,
    document_in: DocumentCreate,
    file: UploadFile,
    owner_id: int,
    upload_dir: str
) -> Document:
    # Create directory if it doesn't exist
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save file
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Get or create tags
    tags = [get_or_create_tag(db, tag_name) for tag_name in document_in.tags]
    
    # Create document
    db_document = Document(
        title=document_in.title,
        description=document_in.description,
        file_path=file_path,
        mime_type=file.content_type,
        owner_id=owner_id,
        version=1,
        tags=tags
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    # Create initial version
    version = DocumentVersion(
        document_id=db_document.id,
        version_number=1,
        file_path=file_path,
    )
    db.add(version)
    db.commit()
    
    return db_document


async def update_document(
    db: Session,
    document: Document,
    document_in: DocumentUpdate,
    file: Optional[UploadFile] = None,
    upload_dir: Optional[str] = None
) -> Document:
    # Update basic information
    update_data = document_in.model_dump(exclude_unset=True)
    
    if file and upload_dir:
        # Save new file version
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file.filename)
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Update document
        document.file_path = file_path
        document.mime_type = file.content_type
        document.version += 1
        
        # Create new version
        version = DocumentVersion(
            document_id=document.id,
            version_number=document.version,
            file_path=file_path,
        )
        db.add(version)
    
    # Update tags if provided
    if "tags" in update_data:
        tags = [get_or_create_tag(db, tag_name) for tag_name in update_data["tags"]]
        document.tags = tags
        del update_data["tags"]
    
    # Update other fields
    for field, value in update_data.items():
        setattr(document, field, value)
    
    document.updated_at = datetime.utcnow()
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


def delete_document(db: Session, document: Document) -> None:
    # Delete associated versions
    db.query(DocumentVersion).filter(
        DocumentVersion.document_id == document.id
    ).delete()
    
    # Delete document
    db.delete(document)
    db.commit()


def get_document_version(
    db: Session,
    document_id: int,
    version_number: int
) -> Optional[DocumentVersion]:
    return db.query(DocumentVersion).filter(
        DocumentVersion.document_id == document_id,
        DocumentVersion.version_number == version_number
    ).first()


def checkout_document(
    db: Session,
    document: Document,
    user_id: int,
    comments: str
) -> Document:
    """Check out a document for editing."""
    if document.current_checkout:
        if document.current_checkout.user_id == user_id:
            return document  # Already checked out by this user
        raise ValueError("Document is already checked out by another user")
    
    # Create checkout record
    document.current_checkout = DocumentCheckout(
        document_id=document.id,
        user_id=user_id,
        checkout_time=datetime.utcnow(),
        comments=comments
    )
    
    # Record checkout activity
    db.add(DocumentActivity(
        document_id=document.id,
        user_id=user_id,
        activity_type="checkout",
        details=comments,
        activity_time=datetime.utcnow()
    ))
    
    db.commit()
    db.refresh(document)
    return document


async def checkin_document(
    db: Session,
    document: Document,
    user_id: int,
    comments: str,
    file: Optional[UploadFile] = None,
    upload_dir: Optional[str] = None
) -> Document:
    """Check in a document after editing."""
    if not document.current_checkout:
        raise ValueError("Document is not checked out")
    if document.current_checkout.user_id != user_id:
        raise ValueError("Document is checked out by another user")
    
    # If a new file version is provided
    if file and upload_dir:
        try:
            # Save new file version
            os.makedirs(upload_dir, exist_ok=True)
            file_path = os.path.join(upload_dir, file.filename)
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            # Update document
            document.file_path = file_path
            document.mime_type = file.content_type
            document.version += 1
            
            # Create new version record
            version = DocumentVersion(
                document_id=document.id,
                version_number=document.version,
                file_path=file_path,
                changes=comments
            )
            db.add(version)
        except Exception as e:
            raise ValueError(f"Error saving file: {str(e)}")
    
    # Record check-in
    document.current_checkout = None
    db.add(DocumentActivity(
        document_id=document.id,
        user_id=user_id,
        activity_type="checkin",
        details=comments,
        activity_time=datetime.utcnow()
    ))
    
    db.commit()
    db.refresh(document)
    return document


def get_document_activities(db: Session, document_id: int) -> list[dict]:
    """Get document activities."""
    activities = (
        db.query(DocumentActivity)
        .filter(DocumentActivity.document_id == document_id)
        .order_by(DocumentActivity.activity_time.desc())
        .all()
    )
    
    return [
        {
            "id": activity.id,
            "activity_type": activity.activity_type,
            "activity_time": activity.activity_time.isoformat(),
            "details": activity.details,
            "user": {
                "id": activity.user.id,
                "username": activity.user.username,
                "full_name": activity.user.full_name
            }
        }
        for activity in activities
    ]
