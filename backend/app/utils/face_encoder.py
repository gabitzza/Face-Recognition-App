import face_recognition
import json
import os
import time

def encode_all_faces(image_path):
    """
    Detectează și encodează toate fețele dintr-o imagine.
    Returnează o listă cu encodările serializabile (listă de 128 floats).
    """
    image = face_recognition.load_image_file(image_path)
    face_locations = face_recognition.face_locations(image, model="hog")
    face_encodings = face_recognition.face_encodings(image, known_face_locations=face_locations, model="large")
    
    print(f"[INFO] {len(face_encodings)} față/fete detectate în {os.path.basename(image_path)}")
    return [list(encoding) for encoding in face_encodings]


def save_encodings(image_path, encodings, output_file="encoded_images.json"):
    """
    Salvează encodările într-un fișier JSON, cu numele fișierului ca și cheie.
    """
    if not encodings:
        print(f"[WARN] Nicio față de salvat pentru {image_path}")
        return

    # Încarcă fișierul existent sau creează unul nou
    if os.path.exists(output_file):
        with open(output_file, "r") as f:
            data = json.load(f)
    else:
        data = {}

    filename = os.path.basename(image_path)
    data[filename] = encodings

    with open(output_file, "w") as f:
        json.dump(data, f, indent=4)

    print(f"[OK] {len(encodings)} față/fete salvate pentru {filename}")


def process_folder(folder_path, output_file="encoded_images.json"):
    """
    Procesează toate imaginile dintr-un folder și salvează encodările în fișierul specificat.
    """
    start_time = time.time()
    total_images = 0

    for filename in os.listdir(folder_path):
        if filename.lower().endswith((".jpg", ".png", ".jpeg")):
            image_path = os.path.join(folder_path, filename)
            print(f"\n[📷] Procesăm: {filename}")
            encodings = encode_all_faces(image_path)
            save_encodings(image_path, encodings, output_file)
            total_images += 1

    elapsed = time.time() - start_time
    print(f"\n✅ Gata! {total_images} imagini procesate în {elapsed:.2f} secunde.")


if __name__ == "__main__":
    folder_path = "images"
    output_file = "encoded_images.json"
    process_folder(folder_path, output_file)
