from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas import contest as schemas
from app.models import contests as models
from app.core.database import get_db

router = APIRouter()

from fastapi import UploadFile, File, Form
import shutil, os
from datetime import datetime

@router.post("/contests", response_model=schemas.ContestOut)
def create_contest(
    name: str = Form(...),
    date: str = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    image_path = None
    if image:
        folder = "app/uploads/contests"
        os.makedirs(folder, exist_ok=True)
        filename = f"{datetime.utcnow().timestamp()}_{image.filename}"
        full_path = os.path.join(folder, filename)
        with open(full_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_path = f"uploads/contests/{filename}" 

    db_contest = models.Contest(name=name, date=date, image_path=image_path)
    db.add(db_contest)
    db.commit()
    db.refresh(db_contest)
    return db_contest
