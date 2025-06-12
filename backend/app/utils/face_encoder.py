import face_recognition
import json
import os
import time
from concurrent.futures import ProcessPoolExecutor
from PIL import Image
import numpy as np
from multiprocessing import Pool, cpu_count

def encode_all_faces(image_path, max_size=(600, 600)):
    """
    Detectează și encodează toate fețele dintr-o imagine redimensionată.
    Returnează o listă cu encodările serializabile (listă de 128 floats).
    """
    # 1. Deschide și redimensionează
    pil_img = Image.open(image_path).convert("RGB")
    pil_img.thumbnail(max_size, Image.Resampling.LANCZOS)
    
    # 2. Convert to numpy array
    img = np.array(pil_img)
    
    # 3. Detectare locații fețe și encoding
    face_locations = face_recognition.face_locations(img, model="hog")
    if not face_locations:
        return []

    print(f"Functia encode_all_faces din face_encoder.py)")
    face_encodings = face_recognition.face_encodings(img, known_face_locations=face_locations, model="large")
    return [encoding.tolist() for encoding in face_encodings]

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
    print(f"Functia save_encodings din face_encoder.py)")
    print(f"[OK] {len(encodings)} față/fete salvate pentru {filename}")


def _worker(filename, folder_path, output_file):
    path = os.path.join(folder_path, filename)
    encodings = encode_all_faces(path)
    save_encodings(path, encodings, output_file)



def process_folder(folder_path, output_file):
    start_time = time.time()
    total_images = 0

    # Construim lista tuturor fișierelor de imagine recursiv
    image_paths = []
    for root, dirs, files in os.walk(folder_path):
        for filename in files:
            if filename.lower().endswith((".jpg", ".png", ".jpeg")):
                image_paths.append(os.path.join(root, filename))

    # Procesăm fiecare imagine
    for image_path in image_paths:
        print(f"\n[📷] Procesăm: {image_path}")
        encodings = encode_all_faces(image_path)
        save_encodings(image_path, encodings, output_file)
        total_images += 1

    print(f"Functia process_folder din face_encoder.py)")
    elapsed = time.time() - start_time
    print(f"\n✅ Gata! {total_images} imagini procesate în {elapsed:.2f} secunde.")



if __name__ == "__main__":
    # setăm folderul uploads din backend/app
    folder_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../uploads")
    )
    output_file = "encoded_images.json"
    process_folder(folder_path, output_file)

# imediat sub if __name__ == "__main__": 
folder_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../uploads")
)
print("→ Folder folosit pentru procesare:", folder_path)
print("→ Conținut directory:", os.listdir(folder_path))
#process_folder(folder_path, output_file)
