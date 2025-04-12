from fastapi import APIRouter, UploadFile, Form, Depends, HTTPException
from sqlalchemy.orm import Session
import shutil
import os
from datetime import datetime
import face_recognition
import json
from app.core.database import get_db
from app.models.photos import Photo

router = APIRouter()

@router.post("/match-photo")
async def match_photo(
    file: UploadFile,
    contest_id: int = Form(...),
    db: Session = Depends(get_db)
):
    # 1. Salvează temporar imaginea primită
    temp_filename = f"temp_{datetime.utcnow().timestamp()}_{file.filename}"
    file_path = os.path.join("app/uploads/temp", temp_filename)
    os.makedirs("app/uploads/temp", exist_ok=True)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. Encodează poza trimisă de alergător
    image = face_recognition.load_image_file(file_path)
    encodings = face_recognition.face_encodings(image)

    if not encodings:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail="Nicio față detectată în imagine.")

    runner_encoding = encodings[0]

    # 3. Caută poze din acel concurs cu encodări salvate
    photos = db.query(Photo).filter(Photo.contest_id == contest_id, Photo.face_encoding.isnot(None)).all()

    matched_photos = []
    for photo in photos:
        try:
            encoding_list = json.loads(photo.face_encoding)  # listă de encodări
            for enc in encoding_list:
                distance = face_recognition.face_distance([enc], runner_encoding)[0]
                if distance < 0.6:
                    matched_photos.append(photo.image_path)
                    break  # nu mai e nevoie să verificăm restul
        except Exception as e:
            print(f"❌ Eroare la comparare cu {photo.image_path}: {e}")
            continue

    # 4. Curățăm fișierul temporar
    os.remove(file_path)

    

    return {"matches": matched_photos}

from app.api.auth import get_current_user
from app.models.user import User

@router.get("/my-matches")
def get_my_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "alergator":
        raise HTTPException(status_code=403, detail="Doar alergătorii pot vedea pozele proprii")

    matched_photos = db.query(Photo).filter(Photo.matched_runner_id == current_user.id).all()

    return {"matched_photos": [photo.image_path for photo in matched_photos]}