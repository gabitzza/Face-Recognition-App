from fastapi import APIRouter, UploadFile, Form, File, Depends, HTTPException
from sqlalchemy.orm import Session
import shutil
import os
import uuid
from datetime import datetime
from app.utils.face_encoder_insight import encode_image_insightface
from app.utils.face_matcher_insight import cosine_similarity
import json
from app.core.database import get_db
from app.models.photos import Photo
from app.api.auth import get_current_user
from app.models.user import User
import unicodedata
import re
from app.models.contests import Contest



router = APIRouter()


# Define the folder where uploaded files will be stored temporarily
UPLOAD_FOLDER = "temp_uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def sanitize_filename(name):
    name = unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode('ascii')
    name = re.sub(r'\s+', '_', name)
    return name

def normalize_path(path):
    # Înlocuiește '-' cu ' - ' doar pentru segmentul relevant
    return path.replace('fotograf-test', 'fotograf - test')

def public_path(db_path):
    return db_path.replace('fotograf - test', 'fotograf-test')

@router.post("/match-photo")
async def match_photo(
    file: UploadFile,
    contest_id: int = Form(...),
    db: Session = Depends(get_db)
):
    from app.utils.face_encoder_insight import encode_image_insightface
    from app.utils.face_matcher_insight import cosine_similarity

    contest = db.query(Contest).filter_by(id=contest_id).first()
    if not contest:
        raise HTTPException(status_code=404, detail="Concurs inexistent")

    contest_name = sanitize_filename(contest.name)

    # Salvează temporar poza
    temp_filename = f"temp_{datetime.utcnow().timestamp()}_{file.filename}"
    file_path = os.path.join("app/uploads/temp", temp_filename)
    os.makedirs("app/uploads/temp", exist_ok=True)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Encode selfie
    encodings = encode_image_insightface(file_path)
    os.remove(file_path)

    if not encodings:
        raise HTTPException(status_code=400, detail="Nicio față detectată în imagine.")

    runner_encoding = encodings[0]

    # Căutăm toate fișierele encoding pentru acel concurs
    encoding_dir = "app/encodings"
    matched_photos = []

    for fname in os.listdir(encoding_dir):
        if not fname.startswith(f"encoded_{contest_name}_") or not fname.endswith(".json"):
            continue

        fpath = os.path.join(encoding_dir, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            all_data = json.load(f)

        # Extragem album_name din numele fișierului
        album_name = fname.removeprefix(f"encoded_{contest_name}_").removesuffix(".json")

        for filename, face_list in all_data.items():
            for known_face in face_list:
                similarity = cosine_similarity(runner_encoding, known_face)
                if similarity > 0.5:
                    matched_photos.append({
                    "image": f"{contest_name}/{album_name}/{filename}",
                    "thumb": f"{contest_name}/thumbs/{album_name}/{filename}"
                })

                    break  # opțional: ieși după prima potrivire pentru acea imagine

    return {
        "matches": matched_photos
    }




@router.get("/my-matches")
def get_my_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "alergator":
        raise HTTPException(status_code=403, detail="Doar alergătorii pot vedea pozele proprii")

    matched_photos = db.query(Photo).filter(Photo.matched_runner_id == current_user.id).all()

    return {
        "matched_photos": [
            {
                "image": photo.image_path,
                "thumb": f"thumbs/{photo.image_path}"
            }
            for photo in matched_photos
        ]
    }



