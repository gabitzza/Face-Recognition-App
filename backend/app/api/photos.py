from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.photos import Photo  # modelul tău pentru poze
from datetime import datetime
import shutil
import os

from .auth import get_current_user

router = APIRouter()

# Funcție DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

UPLOAD_FOLDER = "uploads"

@router.post("/upload-photo")
def upload_photo(
    file: UploadFile = File(...),
    contest_id: int = 1,  # pentru test, ideal primești din form
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "fotograf":
        raise HTTPException(status_code=403, detail="Doar fotografii pot încărca poze")

    # Salvează fișierul în folder local (uploads/nume_fisier)
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Salvează în DB
    photo = Photo(
        file_path=file_path,
        contest_id=contest_id,
        photographer_id=current_user.id,
        uploaded_at=datetime.utcnow()
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)

    return {"message": "Foto încărcată cu succes", "photo_id": photo.id}
