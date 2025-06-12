import os
from face_encoder_parallel_insight import save_thumbnail

def generate_thumbnails_from_folder(folder_path):
    for file in os.listdir(folder_path):
        full_path = os.path.join(folder_path, file)
        if os.path.isfile(full_path):
            thumb_path = save_thumbnail(full_path)
            print(f"[✔️] Thumbnail creat: {thumb_path}")

script_dir = os.path.dirname(os.path.abspath(__file__))  # .../backend/app/utils
project_root = os.path.abspath(os.path.join(script_dir, ".."))  # → .../backend/app
uploads_root = os.path.join(project_root, "uploads")
target_folder = os.path.join(uploads_root, "Predeal_Forest_Run", "portocaliu")

# Rulează generarea
generate_thumbnails_from_folder(target_folder)

if __name__ == "__main__":

    target_folder = "app/uploads/Predeal_Forest_Run/portocaliu"
    generate_thumbnails_from_folder(target_folder)
    print("→ Generare thumbnail-uri pentru:", target_folder)