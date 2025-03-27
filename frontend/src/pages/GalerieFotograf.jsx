import { useEffect, useState } from "react";
import axios from "axios";

function GalerieFotograf() {
    const [photos, setPhotos] = useState([]);

    useEffect(() => {
        const fetchPhotos = async () => {
            const token = localStorage.getItem("token");

            try {
                const res = await axios.get("http://127.0.0.1:8000/my-photos", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setPhotos(res.data);
            } catch (err) {
                console.error("Eroare la preluarea pozelor:", err);
            }
        };

        fetchPhotos();
    }, []);

    return (
        <div style={{ padding: "2rem" }}>
            <h2>📸 Pozele mele încărcate</h2>
            {photos.length === 0 ? (
                <p>Nu ai încărcat nicio poză încă.</p>
            ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                    {photos.map((photo) => (
                        <div key={photo.id}>
                            <img
                                src={`http://127.0.0.1:8000/uploads/${photo.image_path.replace("\\", "/")}`}
                                alt={`Foto ${photo.id}`}
                                style={{ width: "200px", borderRadius: "8px" }}
                            />

                            <p>ID Poză: {photo.id}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default GalerieFotograf;
