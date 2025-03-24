from app.core.database import SessionLocal

try:
    db = SessionLocal()
    print("✅ Conexiune la baza de date reușită!")
finally:
    db.close()