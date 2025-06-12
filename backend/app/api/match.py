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



router = APIRouter()

# Define the folder where uploaded files will be stored temporarily
UPLOAD_FOLDER = "temp_uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@router.post("/match-photo")
async def match_photo(
    file: UploadFile,
    contest_id: int = Form(...),
    db: Session = Depends(get_db)
):
    import os, shutil, json
    from datetime import datetime

    # Salvează temporar imaginea selfie
    temp_filename = f"temp_{datetime.utcnow().timestamp()}_{file.filename}"
    file_path = os.path.join("app/uploads/temp", temp_filename)
    os.makedirs("app/uploads/temp", exist_ok=True)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Encode selfie (folosind InsightFace)
    encodings = encode_image_insightface(file_path)
    os.remove(file_path)

    if not encodings:
        raise HTTPException(status_code=400, detail="Nicio față detectată în imagine.")

    runner_encoding = encodings[0]

    # Încărcăm embeddings deja salvate
    with open("app/utils/encoded_orange.json", "r", encoding="utf-8") as f:
        all_data = json.load(f)

    matched_photos = []
    for filename, face_list in all_data.items():
        for known_face in face_list:
            similarity = cosine_similarity(runner_encoding, known_face)
            print(f"[🔍] {filename} → similarity: {similarity:.4f}")
            if similarity > 0.5:  # poți ajusta threshold-ul (max 1.0)
                matched_photos.append(f"Predeal_Forest_Run/portocaliu/{filename}")
                break

    print(f"✔️ Match-uri găsite: {len(matched_photos)}")
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

