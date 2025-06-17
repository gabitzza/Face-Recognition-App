import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_and_login_flow():
    # Emailuri unice
    email_fotograf = f"foto_{uuid.uuid4().hex[:6]}@example.com"
    email_alergator = f"run_{uuid.uuid4().hex[:6]}@example.com"

    # ===========================
    # 1️⃣ Înregistrare fotograf
    # ===========================
    res_foto = client.post("/auth/register", json={
        "full_name": "Fotograf Test",
        "email": email_fotograf,
        "password": "foto123",
        "role": "fotograf"
    })
    assert res_foto.status_code == 200
    foto_id = res_foto.json()["id"]

    # ===========================
    # 2️⃣ Logare ADMIN
    # ===========================
    res_admin = client.post("/auth/login", json={
        "email": "admin@example.com",
        "password": "admin123"
    })
    assert res_admin.status_code == 200
    admin_token = res_admin.json()["access_token"]
    headers_admin = {"Authorization": f"Bearer {admin_token}"}

    # ===========================
    # 3️⃣ Aprobare fotograf
    # ===========================
    approve = client.patch(f"/auth/approve-photographer/{foto_id}", headers=headers_admin)
    assert approve.status_code == 200

    # ===========================
    # 4️⃣ Logare fotograf aprobat
    # ===========================
    res_login_foto = client.post("/auth/login", json={
        "email": email_fotograf,
        "password": "foto123"
    })
    assert res_login_foto.status_code == 200

    # ===========================
    # 5️⃣ Înregistrare alergător
    # ===========================
    res_run = client.post("/auth/register", json={
        "full_name": "Alergător Test",
        "email": email_alergator,
        "password": "run123",
        "role": "alergator"
    })
    assert res_run.status_code == 200

    # ===========================
    # 6️⃣ Logare alergător
    # ===========================
    res_login_run = client.post("/auth/login", json={
        "email": email_alergator,
        "password": "run123"
    })
    assert res_login_run.status_code == 200
