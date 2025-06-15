import os
import shutil
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException,  BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.photos import Photo
from datetime import datetime
from .auth import get_current_user
from fastapi import Form
from app.models.contests import Contest
import hashlib
import unicodedata
import re
import json
from sqlalchemy.orm import Session
from app.utils.face_encoder_parallel_insight import process_folder
from fastapi import BackgroundTasks
router = APIRouter()

# Calea absolută către folderul 'uploads' din backend/app
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")



# Verificăm dacă calea este calculată corect
print(f"Upload folder path: {UPLOAD_FOLDER}")

# Creăm directorul dacă nu există
if not os.path.exists(UPLOAD_FOLDER):
    print("Folderul uploads nu există. Creăm folderul...")
    os.makedirs(UPLOAD_FOLDER)


def calculate_file_hash(file_obj):
    hasher = hashlib.sha256()
    file_obj.seek(0)
    while chunk := file_obj.read(8192):
        hasher.update(chunk)
    file_obj.seek(0)  # reset pointer
    return hasher.hexdigest()

def sanitize_filename(name):
    # Normalizează diacriticele
    name = unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode('ascii')
    # Înlocuiește spațiile cu underscore
    name = re.sub(r'\s+', '_', name)
    # Elimină orice alt caracter invalid
    name = re.sub(r'[^\w\-_.]', '', name)
    return name

@router.get("/contests")
def get_all_contests(db: Session = Depends(get_db)):
    return db.query(Contest).all()


@router.post("/upload-photo")
def upload_photo(
    background_tasks: BackgroundTasks,  # ✅ adăugat
    file: UploadFile = File(...),
    contest_id: int = Form(...),
    album_title: str = Form(...),
    contest_name: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "fotograf":
        raise HTTPException(status_code=403, detail="Doar fotografii pot încărca poze")

    if not album_title:
        raise HTTPException(status_code=400, detail="Titlul albumului nu poate fi gol.")

    file_hash = calculate_file_hash(file.file)

    existing_photo = db.query(Photo).filter_by(
        photo_hash=file_hash,
        contest_id=contest_id,
        photographer_id=current_user.id
    ).first()
    if existing_photo:
        raise HTTPException(status_code=409, detail="Această poză a fost deja încărcată.")

    contest = db.query(Contest).filter_by(id=contest_id).first()
    if not contest:
        raise HTTPException(status_code=404, detail="Concursul nu a fost găsit.")

    contest_name_clean = sanitize_filename(contest.name)
    album_title_clean = album_title.strip()
    final_album_title = f"{current_user.full_name}-{album_title_clean}".strip()

    album_folder_path = os.path.join(UPLOAD_FOLDER, contest_name_clean, final_album_title)
    os.makedirs(album_folder_path, exist_ok=True)

    file_path = os.path.join(album_folder_path, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    photo = Photo(
        image_path=f"{contest_name_clean}/{final_album_title}/{file.filename}",
        contest_id=contest_id,
        photographer_id=current_user.id,
        uploaded_at=datetime.utcnow(),
        photo_hash=file_hash,
        face_encoding=None
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)

    # === Declanșează procesarea în fundal ===
    output_filename = f"encoded_{contest_name_clean}_{current_user.full_name.replace(' ', '')}-{album_title_clean.replace(' ', '')}.json"
    output_path = os.path.join("app", "encodings", output_filename)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    background_tasks.add_task(process_folder, album_folder_path, output_path)

    return {
        "message": "Foto încărcată cu succes",
        "photo_id": photo.id,
        "encoding_scheduled": True
    }


@router.post("/process-album")
def process_album(
    contest_id: int = Form(...),
    album_title: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.utils.face_encoder_parallel_insight import process_folder

    if current_user.role != "fotograf":
        raise HTTPException(status_code=403, detail="Doar fotografii pot procesa albume.")

    contest = db.query(Contest).filter_by(id=contest_id).first()
    if not contest:
        raise HTTPException(status_code=404, detail="Concursul nu există.")

    contest_name = sanitize_filename(contest.name)
    album_title_clean = album_title.strip()
    final_album_title = f"{current_user.full_name}-{album_title_clean}".strip()
    album_folder_path = os.path.join(UPLOAD_FOLDER, contest_name, final_album_title)

    if not os.path.exists(album_folder_path):
        raise HTTPException(status_code=404, detail="Folderul nu există (pozele nu sunt încărcate complet?)")

    output_filename = f"encoded_{contest_name}_{current_user.full_name.replace(' ', '')}-{album_title_clean.replace(' ', '')}.json"
    output_path = os.path.join("app", "encodings", output_filename)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # 🔁 Procesare paralelă + thumbnails
    process_folder(album_folder_path, output_path)

    return {
        "message": f"Album procesat cu succes",
        "encoded_file": output_filename
    }

@router.get("/debug-face-encoding/{photo_id}")
def debug_encoding(photo_id: int, db: Session = Depends(get_db)):
    photo = db.query(Photo).get(photo_id)
    return {
        "raw": photo.face_encoding,
        "parsed": json.loads(photo.face_encoding) if photo.face_encoding else None
    }
