import face_recognition
import numpy as np
import json
import os

def encode_image(image_path):
    image = face_recognition.load_image_file(image_path)
    encodings = face_recognition.face_encodings(image)

    if not encodings:
        return None  # No face found

    return encodings[0].tolist()  # Convert to list for JSON compatibility

def save_encoding(image_path, encoding, output_file="encoded_images.json"):
    # Load existing data
    if os.path.exists(output_file):
        with open(output_file, "r") as f:
            data = json.load(f)
    else:
        data = {}

    # Use image filename as key
    filename = os.path.basename(image_path)
    data[filename] = encoding

    # Save updated data
    with open(output_file, "w") as f:
        json.dump(data, f, indent=4)
