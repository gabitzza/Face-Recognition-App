from pydantic import BaseModel, EmailStr
from typing import Literal
from datetime import datetime

# ✅ Folosit pentru înregistrare (register)
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: Literal["fotograf", "alergator", "admin"]


# ✅ Folosit pentru login
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ✅ Ce returnăm spre frontend (fără parolă!)
class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        orm_mode = True  # permite conversia din SQLAlchemy model
