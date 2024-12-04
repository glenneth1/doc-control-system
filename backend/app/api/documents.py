import os
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..core.config import get_settings
from ..core.deps import get_current_active_user, get_db
from ..models.models import User
from ..schemas.document import Document, DocumentCreate, DocumentUpdate, DocumentVersion
from ..services import document as document_service

settings = get_settings()
router = APIRouter()


@router.post("", response_model=Document)
async def create_document(
    *,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str | None = Form(None),
    tags: str = Form("")
) -> Document:
    """Create new document."""
    tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
    document_in = DocumentCreate(
        title=title,
        description=description,
        tags=tag_list
    )
    upload_dir = os.path.join(settings.UPLOAD_DIR, str(current_user.id))
    document = await document_service.create_document(
        db=db,
        document_in=document_in,
        file=file,
        owner_id=current_user.id,
        upload_dir=upload_dir
    )
    return document


@router.get("", response_model=list[Document])
def read_documents(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    skip: int = 0,
    limit: int = 100,
) -> list[Document]:
    """Retrieve documents."""
    if current_user.is_superuser:
        documents = document_service.get_documents(db, skip=skip, limit=limit)
    else:
        documents = document_service.get_documents(
            db, skip=skip, limit=limit, owner_id=current_user.id
        )
    return documents


@router.get("/{document_id}", response_model=Document)
def read_document(
    *,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    document_id: int,
) -> Document:
    """Get document by ID."""
    document = document_service.get_document(db, document_id=document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    if not current_user.is_superuser and document.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough permissions",
        )
    return document


@router.put("/{document_id}", response_model=Document)
async def update_document(
    *,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    document_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
    tags: Optional[list[str]] = None,
    file: Optional[UploadFile] = None
) -> Document:
    """Update document."""
    document = document_service.get_document(db, document_id=document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    if not current_user.is_superuser and document.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough permissions",
        )
    
    document_in = DocumentUpdate(
        title=title or document.title,
        description=description if description is not None else document.description,
        tags=tags if tags is not None else [tag.name for tag in document.tags]
    )
    
    upload_dir = None
    if file:
        upload_dir = os.path.join(settings.UPLOAD_DIR, str(current_user.id))
    
    document = await document_service.update_document(
        db=db,
        document=document,
        document_in=document_in,
        file=file,
        upload_dir=upload_dir
    )
    return document


@router.delete("/{document_id}")
def delete_document(
    *,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    document_id: int,
) -> dict[str, str]:
    """Delete document."""
    document = document_service.get_document(db, document_id=document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    if not current_user.is_superuser and document.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough permissions",
        )
    
    document_service.delete_document(db=db, document=document)
    return {"status": "Document successfully deleted"}


@router.get("/{document_id}/download")
async def download_document(
    *,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    document_id: int,
    version: Optional[int] = None
) -> FileResponse:
    """Download document file."""
    try:
        document = document_service.get_document(db, document_id=document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found",
            )
        if not current_user.is_superuser and document.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Not enough permissions",
            )
        
        if version:
            doc_version = document_service.get_document_version(
                db, document_id=document_id, version_number=version
            )
            if not doc_version:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Version {version} not found",
                )
            file_path = doc_version.file_path
        else:
            file_path = document.file_path
        
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found on server",
            )
        
        return FileResponse(
            file_path,
            media_type=document.mime_type,
            filename=os.path.basename(file_path)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error downloading document: {str(e)}",
        )


@router.get("/{document_id}/activities")
def get_document_activities(
    *,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    document_id: int,
) -> list[dict]:
    """Get document activities."""
    document = document_service.get_document(db, document_id=document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    if not current_user.is_superuser and document.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough permissions",
        )
    
    activities = document_service.get_document_activities(db, document_id=document_id)
    return activities


@router.post("/{document_id}/checkout")
async def checkout_document(
    *,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    document_id: int,
    comments: str = Form(...)
) -> Document:
    """Check out a document for editing."""
    try:
        document = document_service.get_document(db, document_id=document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found",
            )
        if not current_user.is_superuser and document.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Not enough permissions",
            )
        
        return document_service.checkout_document(
            db=db,
            document=document,
            user_id=current_user.id,
            comments=comments
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking out document: {str(e)}",
        )


@router.post("/{document_id}/checkin")
async def checkin_document(
    *,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    document_id: int,
    comments: str = Form(...),
    new_version: Optional[UploadFile] = File(None)
) -> Document:
    """Check in a document after editing."""
    try:
        document = document_service.get_document(db, document_id=document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found",
            )
        if not current_user.is_superuser and document.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Not enough permissions",
            )
        
        upload_dir = None
        if new_version:
            upload_dir = os.path.join(settings.UPLOAD_DIR, str(current_user.id))
        
        return await document_service.checkin_document(
            db=db,
            document=document,
            user_id=current_user.id,
            comments=comments,
            file=new_version,
            upload_dir=upload_dir
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking in document: {str(e)}",
        )
