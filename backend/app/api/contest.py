from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas import contest as schemas
from app.models import contests as models
from app.core.database import get_db
from fastapi import HTTPException

router = APIRouter()

from fastapi import UploadFile, File, Form
import shutil, os
from datetime import datetime
from typing import Optional

@router.post("/contests", response_model=schemas.ContestOut)
def create_contest(
    name: str = Form(...),
    date: str = Form(...),
    image: UploadFile = File(None),
    url: Optional[str] = Form(None),
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

    db_contest = models.Contest(
    name=name,
    date=date,
    url=url,  
    image_path=image_path
    )
    db.add(db_contest)
    db.commit()
    db.refresh(db_contest)
    return db_contest


@router.delete("/contests/{contest_id}")
def delete_contest(contest_id: int, db: Session = Depends(get_db)):
    contest = db.query(models.Contest).filter(models.Contest.id == contest_id).first()
    if not contest:
        raise HTTPException(status_code=404, detail="Concursul nu a fost găsit.")
    
    # Șterge fișierul imagine de pe disc (dacă există)
    if contest.image_path:
        full_path = os.path.join("app", contest.image_path)
        if os.path.exists(full_path):
            os.remove(full_path)

    db.delete(contest)
    db.commit()
    return {"message": "Concursul a fost șters cu succes."}

@router.put("/contests/{contest_id}", response_model=schemas.ContestOut)
def update_contest(
    contest_id: int,
    name: str = Form(...),
    date: str = Form(...),
    url: Optional[str] = Form(None), 
    image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    contest = db.query(models.Contest).filter(models.Contest.id == contest_id).first()
    if not contest:
        raise HTTPException(status_code=404, detail="Concursul nu a fost găsit.")

    contest.name = name
    contest.date = date
    contest.url = url

    if image:
        # Șterge vechea imagine
        if contest.image_path:
            try:
                os.remove(os.path.join("app", contest.image_path))
            except FileNotFoundError:
                pass

        filename = f"{datetime.utcnow().timestamp()}_{image.filename}"
        folder = "app/uploads/contests"
        os.makedirs(folder, exist_ok=True)
        full_path = os.path.join(folder, filename)
        with open(full_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        contest.image_path = f"uploads/contests/{filename}"

    db.commit()
    db.refresh(contest)
    return contest
