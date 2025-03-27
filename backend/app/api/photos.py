import os
import shutil
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.photos import Photo
from datetime import datetime
from .auth import get_current_user

router = APIRouter()

# Calea absolută către folderul 'uploads' din backend/app
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")

# Verificăm dacă calea este calculată corect
print(f"Upload folder path: {UPLOAD_FOLDER}")

# Creăm directorul dacă nu există
if not os.path.exists(UPLOAD_FOLDER):
    print("Folderul uploads nu există. Creăm folderul...")
    os.makedirs(UPLOAD_FOLDER)

# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload-photo")
def upload_photo(
    file: UploadFile = File(...),
    contest_id: int = 1,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "fotograf":
        raise HTTPException(status_code=403, detail="Doar fotografii pot încărca poze")

    # Definirea corectă a fișierului
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    
    # Afișează calea unde va fi salvat fișierul
    print(f"Se încearcă salvarea fișierului în: {file_path}")
    
    # Salvează fișierul în folderul uploads
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Salvează informațiile în baza de date
    photo = Photo(
        image_path=f"uploads/{file.filename}",  # Calea relativă pentru a fi folosită în API
        contest_id=contest_id,
        photographer_id=current_user.id,
        uploaded_at=datetime.utcnow()
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)

    return {"message": "Foto încărcată cu succes", "photo_id": photo.id}