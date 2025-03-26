from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.photos import Photo
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/my-photos")
def get_my_photos(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "fotograf":
        raise HTTPException(status_code=403, detail="Acces interzis — doar fotografii pot vedea această galerie")

    photos = db.query(Photo).filter(Photo.photographer_id == current_user.id).all()
    return photos
