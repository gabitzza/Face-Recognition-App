from sqlalchemy import Table, Column, Integer, ForeignKey
from app.core.database import Base

photo_favorite_table = Table(
    "photo_favorites",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("photo_id", Integer, ForeignKey("photos.id"))
)
