from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.photos import Photo
from app.api.auth import get_current_user
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()

class DeleteGalleryPhoto(BaseModel):
    image_path: str

@router.get("/my-photos")
def get_my_photos(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "fotograf":
        raise HTTPException(status_code=403, detail="Acces interzis — doar fotografii pot vedea această galerie")

    photos = db.query(Photo).filter(Photo.photographer_id == current_user.id).all()
    return photos

import os
from fastapi import status

@router.delete("/delete-from-gallery")
def delete_from_gallery(
    data: DeleteGalleryPhoto,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 🔁 Folosim matched_runner_id în loc de photographer_id
    photo = db.query(Photo).filter_by(
        matched_runner_id=current_user.id,
        image_path=data.image_path
    ).first()

    if photo:
        db.delete(photo)
        db.commit()

    # 🧹 Șterge fișierul de pe disc
    full_path = os.path.join("app", "uploads", data.image_path.replace("uploads/", ""))
    if os.path.exists(full_path):
        os.remove(full_path)
        return {"message": "Poza a fost ștearsă din galerie și din sistemul de fișiere."}
    else:
        raise HTTPException(status_code=404, detail="Fișierul nu există.")
