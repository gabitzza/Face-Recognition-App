from pydantic import BaseModel
from datetime import datetime

class ContestCreate(BaseModel):
    name: str
    date: datetime

class ContestOut(BaseModel):
    id: int
    name: str
    date: datetime

    class Config:
        from_attributes = True  # echivalentul vechiului orm_mode = True
