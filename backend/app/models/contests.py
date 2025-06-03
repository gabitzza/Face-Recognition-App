from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Contest(Base):
    __tablename__ = "contests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String)
    date = Column(DateTime)
    image_path = Column(String, nullable=True) 
    created_at = Column(DateTime(timezone=True), server_default=func.now())

