import { useState } from "react";
import axios from "axios";

function DashboardFotograf() {
  const [file, setFile] = useState(null);
  const [contestId, setContestId] = useState(1); // sau dintr-un drop-down

  const handleUpload = async () => {
    const token = localStorage.getItem("token");

    if (!file) {
      alert("Alege o imagine!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("contest_id", contestId); // dacă e primit ca field

    try {
      const res = await axios.post("http://127.0.0.1:8000/upload-photo", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      alert("Poză încărcată cu succes!");
      console.log(res.data);
    } catch (err) {
      alert("Eroare la upload.");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Upload Poze</h2>

      {/* Drop-down pentru concursuri (mock) */}
      <select onChange={(e) => setContestId(e.target.value)} value={contestId}>
        <option value={1}>Brașov Marathon</option>
        <option value={2}>Festivalul Sporturilor</option>
      </select>

      <br />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Încarcă</button>
    </div>
  );
}

export default DashboardFotograf;
