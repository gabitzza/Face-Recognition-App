import uuid
from pathlib import Path

def test_match_photo_flow(client):
    image_path = str(Path("tests") / "test_image.jpg")

    # 🔐 Autentificare admin
    login_admin = client.post("/auth/login", json={
        "email": "admin@example.com",
        "password": "admin123"
    })
    token_admin = login_admin.json()["access_token"]
    headers_admin = {"Authorization": f"Bearer {token_admin}"}

    # 🏁 Creează concurs
    contest_resp = client.post("/contests", headers=headers_admin, data={
        "name": "Match Contest",
        "date": "2025-07-01"
    })
    assert contest_resp.status_code == 200
    contest_id = contest_resp.json()["id"]

    # 🧍 Înregistrare alergător
    runner_email = f"runner_{uuid.uuid4().hex[:6]}@example.com"
    runner_reg = client.post("/auth/register", json={
        "full_name": "Alergător Test",
        "email": runner_email,
        "password": "alerg123",
        "role": "alergator"
    })
    assert runner_reg.status_code == 200

    # 📸 Înregistrare fotograf și aprobare
    email_foto = f"foto_{uuid.uuid4().hex[:6]}@example.com"
    reg_foto = client.post("/auth/register", json={
        "full_name": "Foto Matcher",
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

    # ☁️ Upload foto
    with open(image_path, "rb") as image_file:
        upload_resp = client.post(
            "/api/upload-photo",
            headers=headers_foto,
            files={"file": ("test_image.jpg", image_file, "image/jpeg")},
            data={
                "contest_id": str(contest_id),
                "album_title": "Album Matching",
                "contest_name": "Match Contest"
            }
        )
    assert upload_resp.status_code == 200

    # 🧠 Matching – folosim aceeași imagine ca "selfie"
    with open(image_path, "rb") as selfie:
        match_resp = client.post(
            "/match-photo",
            headers=headers_foto,
            files={"file": ("selfie.jpg", selfie, "image/jpeg")},
            data={"contest_id": str(contest_id)}
        )
    assert match_resp.status_code == 200
