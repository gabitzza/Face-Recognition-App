from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas import contest as schemas
from app.models import contests as models
from app.core.database import get_db

router = APIRouter()

@router.post("/contests", response_model=schemas.ContestOut)
def create_contest(contest: schemas.ContestCreate, db: Session = Depends(get_db)):
    db_contest = models.Contest(name=contest.name, date=contest.date)
    db.add(db_contest)
    db.commit()
    db.refresh(db_contest)
    return db_contest

def list_contests(db: Session = Depends(get_db)):
    return db.query(models.Contest).all()
