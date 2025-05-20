from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.photos import Photo
from app.models.favorites import photo_favorite_table


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255))
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relații (opțional, le folosim dacă vrem să accesăm photos direct din user)
    photos_taken = relationship("Photo", back_populates="photographer", foreign_keys="Photo.photographer_id")
    matched_photos = relationship("Photo", back_populates="matched_runner", foreign_keys="Photo.matched_runner_id")

    favorite_photos = relationship(
        "Photo",
        secondary=photo_favorite_table,
        back_populates="favorited_by"
    )
