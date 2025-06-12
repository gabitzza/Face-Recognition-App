import os
import json
import time
import argparse
from concurrent.futures import ProcessPoolExecutor, as_completed
from functools import partial
from PIL import Image
import face_recognition
import numpy as np

def process_image(image_path: str, model: str):
    try:
        img = Image.open(image_path).convert("RGB")
        arr = np.array(img)

        locs = face_recognition.face_locations(arr, model=model)
        if not locs:
            return os.path.basename(image_path), []

        encs = face_recognition.face_encodings(arr, known_face_locations=locs)
        return os.path.basename(image_path), [list(e) for e in encs]

    except Exception as e:
        print(f"[ERROR] {image_path}: {e}")
        return os.path.basename(image_path), []

def process_folder(folder: str, output: str, workers: int, model: str):
    start = time.time()
    images = [
        os.path.join(folder, f)
        for f in os.listdir(folder)
        if f.lower().endswith(('.jpg', '.jpeg', '.png'))
    ]

    all_results = {}
    with ProcessPoolExecutor(max_workers=workers) as exe:
        fn = partial(process_image, model=model)
        futures = {exe.submit(fn, img): img for img in images}
        for fut in as_completed(futures):
            name, encs = fut.result()
            if encs:
                all_results[name] = encs
                print(f"[OK] {len(encs)} faces in {name}")
            else:
                print(f"[WARN] no faces in {name}")

    with open(output, 'w', encoding='utf-8') as f:
        json.dump(all_results, f, indent=2)

    print(f"✅ Done! {len(images)} images in {time.time() - start:.2f}s, results in {output}")

if __name__ == "__main__":
    p = argparse.ArgumentParser(description="Parallel face encoding")
    p.add_argument("folder", help="Path to images folder")
    p.add_argument("--output", default="encoded_images.json", help="Output JSON file")
    p.add_argument("--workers", type=int, default=os.cpu_count(), help="Number of parallel workers")
    p.add_argument("--model", choices=["hog", "cnn"], default="hog", help="Face detection model")
    args = p.parse_args()

    process_folder(args.folder, args.output, args.workers, args.model)
