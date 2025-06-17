from app.core.database import SessionLocal
from app.models.user import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
db = SessionLocal()

admin_email = "admin@example.com"
existing = db.query(User).filter_by(email=admin_email).first()

if existing:
    print("✅ Adminul există deja.")
else:
    admin = User(
        full_name="Admin Principal",
        email=admin_email,
        password_hash=pwd_context.hash("admin123"),
        role="admin",
        is_approved=True
    )
    db.add(admin)
    db.commit()
    print("✅ Admin creat cu succes.")
