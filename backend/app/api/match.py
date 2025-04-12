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
    # Salvează fișierul temporar
    temp_filename = f"temp_{datetime.utcnow().timestamp()}_{file.filename}"
    file_path = os.path.join("app/uploads/temp", temp_filename)
    os.makedirs("app/uploads/temp", exist_ok=True)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Obține encodingul alergătorului
    image = face_recognition.load_image_file(file_path)
    encodings = face_recognition.face_encodings(image)

    if not encodings:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail="Nicio față detectată în imagine.")

    runner_encoding = encodings[0]

    # Caută poze din acel concurs care au encoding
    photos = db.query(Photo).filter(Photo.contest_id == contest_id, Photo.face_encoding.isnot(None)).all()

    matched_photos = []
    for photo in photos:
        try:
            face_encoding_db = json.loads(photo.face_encoding)
            known_encoding = json.loads(photo.face_encoding)
            matches = face_recognition.compare_faces([known_encoding], runner_encoding)
            distance = face_recognition.face_distance([face_encoding_db], runner_encoding)[0]
            print(f"→ {photo.image_path} | Distance={distance}")

            if distance < 0.6:
                print(f"✔️ Match sub 0.7: {photo.image_path}")
                matched_photos.append(photo)
        except Exception as e:
            print(f"❌ Eroare la comparare cu {photo.image_path}: {e}")
            continue

    # Ștergem fișierul temporar
    os.remove(file_path)
    
    print("Matched photos:", matched_photos)

    return {"matches": matched_photos}
