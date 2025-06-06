from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class ContestCreate(BaseModel):
    name: str
    date: datetime
    url: Optional[str] = None

class ContestOut(BaseModel):
    id: int
    name: str
    date: datetime
    image_path: Optional[str]  # ← nou
    url: Optional[str] = None

    class Config:
        from_attributes = True  # echivalentul vechiului orm_mode = True
