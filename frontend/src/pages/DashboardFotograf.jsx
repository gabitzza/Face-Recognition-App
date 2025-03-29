import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 

function DashboardFotograf() {
  const [file, setFile] = useState(null);
  const [contestId, setContestId] = useState(1); // sau dintr-un drop-down
  const [albumTitle, setAlbumTitle] = useState(""); // Titlul albumului
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUserName(userData.full_name);
    }
  }, []);

  const handleUpload = async () => {
    const token = localStorage.getItem("token");
  
    if (!file || file.length === 0) {
      alert("Alege cel puțin o imagine!");
      return;
    }
  
    for (let i = 0; i < file.length; i++) {
      const formData = new FormData();
      formData.append("file", file[i]);
      formData.append("album_title", albumTitle);
      formData.append("album_title", albumTitle);
      console.log("albumTitle trimis:", albumTitle);
      formData.append("contest_id", contestId);
  
      try {
        const res = await axios.post("http://127.0.0.1:8000/upload-photo", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        console.log(`✅ Poză ${file[i].name} încărcată cu succes!`, res.data);
      } catch (err) {
        if (err.response?.status === 409) {
          alert(`❗ Poza ${file[i].name} a fost deja încărcată.`);
        } else {
          console.error(`❌ Eroare la poza ${file[i].name}:`, err);
        }
      }
    }
  
    alert("Toate pozele au fost procesate!");
  };
  

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📸 Bun venit, {userName || "Fotograf"}!</h2>
      <p>Aici vei putea selecta concursuri și încărca poze.</p>

      <select onChange={(e) => setContestId(e.target.value)} value={contestId}>
        <option value={1}>Brașov Marathon</option>
        <option value={2}>Festivalul Sporturilor</option>
      </select>

      <br />
      <input
        type="text"
        placeholder="Titlul albumului"
        onChange={(e) => setAlbumTitle(e.target.value)}
        value={albumTitle}
        required
      />
      <br />
      <br />
      <input
        type="file"
        multiple
        onChange={(e) => setFile(e.target.files)}
      />

      <button onClick={handleUpload}>Încarcă</button>
      <button onClick={() => navigate("/galerie-fotograf")}>Vezi Galeria Mea</button>
    </div>
  );
}

export default DashboardFotograf;
