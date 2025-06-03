from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class ContestCreate(BaseModel):
    name: str
    date: datetime

class ContestOut(BaseModel):
    id: int
    name: str
    date: datetime
    image_path: Optional[str]  # ← nou

    class Config:
        from_attributes = True  # echivalentul vechiului orm_mode = True
