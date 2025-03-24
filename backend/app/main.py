from fastapi import FastAPI
from app.api import auth

app = FastAPI(
    title="Face Recognition App",
    description="API pentru înregistrare, autentificare și gestionare poze",
    version="1.0"
)

# 🔗 Înregistrăm rutele
app.include_router(auth.router, tags=["Autentificare"])
