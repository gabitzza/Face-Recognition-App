import uuid
from pathlib import Path

def test_photo_upload_flow(client):
    # 📁 Setup
    image_path = str(Path("tests") / "test_image.jpg")

    # ✅ Login admin existent
    login_admin = client.post("/auth/login", json={
        "email": "admin@example.com",
        "password": "admin123"
    })
    token_admin = login_admin.json()["access_token"]
    headers_admin = {"Authorization": f"Bearer {token_admin}"}

    # ✅ Creează concurs
    contest_resp = client.post("/contests", headers=headers_admin, data={
        "name": "Test Contest",
        "date": "2025-06-20"
    })
    assert contest_resp.status_code == 200
    contest_id = contest_resp.json()["id"]

    # ✅ Înregistrează fotograf și aprobă
    email_foto = f"foto_{uuid.uuid4().hex[:6]}@example.com"
    reg_foto = client.post("/auth/register", json={
        "full_name": "Foto Tester",
        "email": email_foto,
        "password": "foto123",
        "role": "fotograf"
    })
    foto_id = reg_foto.json()["id"]
    client.patch(f"/auth/approve-photographer/{foto_id}", headers=headers_admin)

    login_foto = client.post("/auth/login", json={
        "email": email_foto,
        "password": "foto123"
    })
    token_foto = login_foto.json()["access_token"]
    headers_foto = {"Authorization": f"Bearer {token_foto}"}

    # ✅ Upload poză
    with open(image_path, "rb") as image_file:
        upload_resp = client.post(
            "/api/upload-photo",  # ← prefixul corect
            headers=headers_foto,
            files={"file": ("test_image.jpg", image_file, "image/jpeg")},
            data={
                "contest_id": str(contest_id),
                "album_title": "Test Album",
                "contest_name": "Test Contest"
            }
        )
    assert upload_resp.status_code == 200
