from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # 👈 import nou
from app.api import auth
from fastapi import FastAPI, Request
from app.api import auth, photos
from app.models import user, photos as photo_model, contests
from app.core.database import Base, engine
from app.api import gallery 
from fastapi.staticfiles import StaticFiles
from app.api import contest 
from app.api import match
from app.api import gallery
import os

app = FastAPI()

@app.on_event("startup")
async def list_routes_on_startup():
    from fastapi.routing import APIRoute
    print("\n📋 RUTE ACTIVE:")
    for route in app.routes:
        if isinstance(route, APIRoute):
            print(f"{route.path} [{', '.join(route.methods)}]")

#  CORS Middleware – trebuie pus ÎNAINTE de rute
app.add_middleware(
    CORSMiddleware,
    allow_origins=["api/5173"],  # Your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#  Creează tabelele (asigură-te că modelele sunt importate)
Base.metadata.create_all(bind=engine)

# ✅ Înregistrăm rutele API
app.include_router(auth.router, prefix="/auth", tags=["Autentificare"])
app.include_router(photos.router, prefix="/api")
app.include_router(photos.router)
app.include_router(gallery.router, tags=["Galerie"]) 
app.mount("/uploads", StaticFiles(directory="app/uploads"), name="uploads")
app.include_router(match.router)
app.include_router(contest.router)


#  Middleware pentru logare requesturi
@app.middleware("http")
async def log_requests(request: Request, call_next):
    response = await call_next(request)
    print(f"📡 {request.method} {request.url} → {response.status_code}")
    return response