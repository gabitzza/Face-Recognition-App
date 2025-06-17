import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Verificăm dacă suntem în modul de test
IS_TEST = os.getenv("TESTING") == "1"

# Comutăm între baza reală și baza de test
SQLALCHEMY_DATABASE_URL = (
    "postgresql://postgres:gabriela9.@localhost/face_recognition_test"
    if IS_TEST
    else "postgresql://postgres:gabriela9.@localhost/facerecognitiondb"
)

# Creează engine-ul
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Creează session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declară baza pentru modele
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
