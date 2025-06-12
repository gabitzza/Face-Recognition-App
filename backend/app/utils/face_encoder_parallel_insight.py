import os
import json
import time
from concurrent.futures import ProcessPoolExecutor, as_completed
from functools import partial
from PIL import Image
from face_encoder_insight import encode_image_insightface


def save_thumbnail(original_path, size=(600, 400)):
    from PIL import Image
    import os

    img = Image.open(original_path).convert("RGB")
    img.thumbnail(size, Image.Resampling.LANCZOS)

    abs_base = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
    abs_original = os.path.abspath(original_path)

    if not abs_original.startswith(abs_base):
        print(f"[SKIP] Fișierul nu este în uploads/: {abs_original}")
        return None

    relative = os.path.relpath(abs_original, abs_base)
    parts = relative.split(os.sep)

    if len(parts) < 2:
        print(f"[SKIP] Cale relativă invalidă: {relative}")
        return None

    thumb_parts = [parts[0], "thumbs"] + parts[1:-1]
    thumb_folder = os.path.join(abs_base, *thumb_parts)
    os.makedirs(thumb_folder, exist_ok=True)

    thumb_path = os.path.join(thumb_folder, parts[-1])
    img.save(thumb_path)

    if os.path.exists(thumb_path):
        print(f"[✅] Thumbnail salvat fizic la: {thumb_path}")
    else:
        print(f"[❌] EROARE: Nu s-a putut salva: {thumb_path}")

    return thumb_path


def process_image(image_path: str):
    try:
        embeddings = encode_image_insightface(image_path)
        if embeddings:
            save_thumbnail(image_path)
        return os.path.basename(image_path), embeddings
    except Exception as e:
        print(f"[ERROR] {image_path}: {e}")
        return os.path.basename(image_path), []
    

def process_folder(folder: str, output_file: str, workers: int = os.cpu_count()):
    start = time.time()

    images = [
        os.path.join(folder, f)
        for f in os.listdir(folder)
        if f.lower().endswith(('.jpg', '.jpeg', '.png'))
    ]

    total_faces = 0
    results = {}

    with ProcessPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(process_image, img): img for img in images}
        for future in as_completed(futures):
            filename, encs = future.result()
            if encs:
                results[filename] = encs
                total_faces += len(encs)
                print(f"[OK] {len(encs)} fețe în {filename}")
            else:
                print(f"[WARN] fără fețe în {filename}")

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    elapsed = time.time() - start
    print(f"\n✅ Gata! {len(images)} imagini procesate în {elapsed:.2f} secunde.")
    print(f"👥 Total fețe detectate și encodate: {total_faces}")
    print(f"📝 Salvat în: {output_file}")


if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser(description="Encode fețe folosind InsightFace în paralel")
    p.add_argument("folder", help="Folderul cu imagini")
    p.add_argument("--output", default="encoded_insightface.json", help="Fișierul de ieșire JSON")
    p.add_argument("--workers", type=int, default=os.cpu_count(), help="Număr de procese paralele")
    args = p.parse_args()

    process_folder(args.folder, args.output, args.workers)
