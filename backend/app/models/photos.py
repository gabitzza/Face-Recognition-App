from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy import Column, String

from app.core.database import Base
from app.models.favorites import photo_favorite_table


class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(Text, nullable=False)  # ex: uploads/img_123.jpg
    face_encoding = Column(Text)  # JSON string (vector 128 floats)
    contest_id = Column(Integer, ForeignKey("contests.id", ondelete="CASCADE"))
    photographer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    matched_runner_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    # Noul câmp pentru encoding
    face_encoding = Column(Text, nullable=True)
    photo_hash = Column(String, index=True, nullable=False)

    # Relații (doar dacă ai deja User model)
    photographer = relationship("User", back_populates="photos_taken", foreign_keys=[photographer_id])
    matched_runner = relationship("User", back_populates="matched_photos", foreign_keys=[matched_runner_id])

    favorited_by = relationship(
        "User",
        secondary=photo_favorite_table,
        back_populates="favorite_photos"
    )
