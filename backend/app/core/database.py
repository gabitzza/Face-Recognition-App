from sqlalchemy import create_engine # type: ignore
from sqlalchemy.ext.declarative import declarative_base # type: ignore
from sqlalchemy.orm import sessionmaker # type: ignore

# URL pentru conexiune
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:gabriela9.@localhost/facerecognitiondb"

# Creează engine-ul
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Creează session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declară baza pentru modele
Base = declarative_base()
