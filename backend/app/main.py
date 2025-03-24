from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # 👈 import nou
from app.api import auth

app = FastAPI(
    title="Face Recognition App",
    description="API pentru înregistrare, autentificare și gestionare poze",
    version="1.0"
)

# 🔓 Middleware pentru CORS – permite frontend-ului să trimită request-uri
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # sau ["*"] în dezvoltare
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔗 Înregistrăm rutele
app.include_router(auth.router, tags=["Autentificare"])
