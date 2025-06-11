from fastapi import APIRouter, UploadFile, Form, File, Depends, HTTPException
from sqlalchemy.orm import Session
import shutil
import os
import uuid
from datetime import datetime
import face_recognition
import json
from app.core.database import get_db
from app.models.photos import Photo
from app.api.auth import get_current_user
from app.models.user import User

def encode_all_faces(image_path):
    """Encode all faces in the given image file and return a list of encodings."""
    image = face_recognition.load_image_file(image_path)
    encodings = face_recognition.face_encodings(image)
    return encodings


router = APIRouter()

# Define the folder where uploaded files will be stored temporarily
UPLOAD_FOLDER = "temp_uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@router.post("/match-photo")
def match_photo(
    file: UploadFile = File(...),
    contest_id: int = Form(...),
    db: Session = Depends(get_db)
):
    # Salvare temporară fișier
    ext = os.path.splitext(file.filename)[1]
    filename = f"temp_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Encode selfie
    encodings = encode_all_faces(file_path)
    os.remove(file_path)

    if not encodings:
        raise HTTPException(status_code=400, detail="Nicio față detectată în imagine.")

    runner_encoding = encodings[0]

    # Caută poze în același concurs
    photos = db.query(Photo).filter(Photo.contest_id == contest_id).all()

    matched_photos = []

    for photo in photos:
        if not photo.face_encoding:
            continue

        try:
            encoding_list = json.loads(photo.face_encoding)
            for enc in encoding_list:
                distance = face_recognition.face_distance([enc], runner_encoding)[0]
                print(f"[🔍] {photo.image_path} → distance: {distance:.4f}")
                if distance < 0.6:
                    matched_photos.append(photo.image_path)
                    break
        except Exception as e:
            print(f"[⚠️] Eroare la {photo.image_path}: {e}")

    # Log rezultate
    print("✔️ [MATCH RESULT] Poze cu distanță < 0.6:")
    for path in matched_photos:
        print(f" → {path}")
    print(f"📤 Returnez {len(matched_photos)} rezultate către frontend.")

    return {"matches": matched_photos}


@router.post("/save-to-gallery")
def save_to_gallery(data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    photo = db.query(Photo).filter(Photo.image_path == data["image_path"]).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Poza nu există")
    photo.matched_runner_id = current_user.id
    db.commit()
    return {"message": "Salvat în galerie"}

@router.get("/my-matches")
def get_my_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "alergator":
        raise HTTPException(status_code=403, detail="Doar alergătorii pot vedea pozele proprii")

    matched_photos = db.query(Photo).filter(Photo.matched_runner_id == current_user.id).all()
    return {"matched_photos": [photo.image_path for photo in matched_photos]}

@router.post("/add-to-favorites")
def add_to_favorites(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    image_path = data.get("image_path")
    if not image_path:
        raise HTTPException(status_code=400, detail="Path invalid")

    photo = db.query(Photo).filter(Photo.image_path == image_path).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Poza nu există")

    # ⚠️ Încarcă user-ul în sesiunea activă!
    user = db.query(User).filter(User.id == current_user.id).first()

    if user in photo.favorited_by:
        raise HTTPException(status_code=409, detail="Poza este deja la favorite")

    photo.favorited_by.append(user)
    db.commit()
    return {"message": "Adăugat la favorite"}

@router.get("/favorites")
def get_favorite_photos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()

    favorites = user.favorite_photos  # relație definită în User model
    return {"favorites": [photo.image_path for photo in favorites]}


@router.delete("/remove-from-favorites")
def remove_from_favorites(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    image_path = data.get("image_path")
    if not image_path:
        raise HTTPException(status_code=400, detail="Path invalid")

    photo = db.query(Photo).filter(Photo.image_path == image_path).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Poza nu există")

    user = db.query(User).filter(User.id == current_user.id).first()

    if user in photo.favorited_by:
        photo.favorited_by.remove(user)
        db.commit()
        return {"message": "Poza a fost eliminată din favorite"}

    raise HTTPException(status_code=404, detail="Poza nu era în favorite")

