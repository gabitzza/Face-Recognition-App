import os
import shutil
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.photos import Photo
from datetime import datetime
from .auth import get_current_user
from fastapi import Form
import hashlib

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

def calculate_file_hash(file_obj):
    hasher = hashlib.sha256()
    file_obj.seek(0)
    while chunk := file_obj.read(8192):
        hasher.update(chunk)
    file_obj.seek(0)  # reset pointer
    return hasher.hexdigest()

@router.post("/upload-photo")
def upload_photo(
    file: UploadFile = File(...),
    contest_id: int = 1,
    album_title: str = Form(...),  # Adăugăm album_title
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
 
):
    

    print(f"Album title received: '{album_title}'")  # Log titlu album
    print(f"File received: {file.filename}")  # Log fișie
    if current_user.role != "fotograf":
        raise HTTPException(status_code=403, detail="Doar fotografii pot încărca poze")
    
    if not album_title:
        raise HTTPException(status_code=400, detail="Titlul albumului nu poate fi gol.")

    print(f"Album title received: '{album_title}'")  # Log titlu album
    print(f"File received: {file.filename}")  # Log fișierul

   # 1. Verificăm rolul
    if current_user.role != "fotograf":
        raise HTTPException(status_code=403, detail="Doar fotografii pot încărca poze")

    # 2. Verificăm titlul albumului
    if not album_title:
        raise HTTPException(status_code=400, detail="Titlul albumului nu poate fi gol.")

    # 3. Calculăm hash-ul ÎNAINTE să citim fișierul complet
    file_hash = calculate_file_hash(file.file)

    # 4. Verificăm în DB dacă fișierul există deja
    existing_photo = db.query(Photo).filter_by(
        photo_hash=file_hash,
        contest_id=contest_id,
        photographer_id=current_user.id
    ).first()

    if existing_photo:
        raise HTTPException(status_code=409, detail="Această poză a fost deja încărcată.")

    # 5. Salvăm fișierul fizic
    album_folder_path = os.path.join(UPLOAD_FOLDER, album_title)
    if not os.path.exists(album_folder_path):
        os.makedirs(album_folder_path)

    file_path = os.path.join(album_folder_path, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 6. Salvăm în baza de date
    photo = Photo(
        image_path=f"{album_title}/{file.filename}",
        contest_id=contest_id,
        photographer_id=current_user.id,
        uploaded_at=datetime.utcnow(),
        photo_hash=file_hash  # 👈 Adăugat corect aici
    )

    db.add(photo)
    db.commit()
    db.refresh(photo)

    return {"message": "Foto încărcată cu succes", "photo_id": photo.id}