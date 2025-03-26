from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # 👈 import nou
from app.api import auth
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def log_requests(request: Request, call_next):
    response = await call_next(request)
    print(f"📡 {request.method} {request.url} → {response.status_code}")
    return response

# 🔓 Middleware pentru CORS – permite frontend-ului să trimită request-uri
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5176"],  # sau ["*"] în dezvoltare
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔗 Înregistrăm rutele
app.include_router(auth.router, tags=["Autentificare"])
