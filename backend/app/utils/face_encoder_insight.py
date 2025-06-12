from insightface.app import FaceAnalysis
import numpy as np
import cv2

# Inițializăm o singură instanță (face detecție + embeddings ArcFace)
app = FaceAnalysis(name="buffalo_l")
app.prepare(ctx_id=0)  # 0 = GPU, -1 = CPU

def encode_image_insightface(image_path):
    """
    Returnează o listă de vectori faciali (embeddinguri) pentru toate fețele din imagine.
    """
    img = cv2.imread(image_path)
    if img is None:
        print(f"[ERROR] Nu s-a putut deschide {image_path}")
        return []

    faces = app.get(img)
    if not faces:
        print(f"[WARN] Nicio față detectată în {image_path}")
        return []

    return [face.embedding.tolist() for face in faces]