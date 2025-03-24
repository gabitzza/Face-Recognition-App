from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserOut
from app.models.user import User
from app.core.database import SessionLocal
from passlib.context import CryptContext

router = APIRouter()

# Configurare pentru hash-ul parolei
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Funcție pentru a genera hash-ul parolei
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Dependency pentru sesiune DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 🚀 Ruta pentru înregistrare user
@router.post("/register", response_model=UserOut)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password_hash=hash_password(user.password),
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
