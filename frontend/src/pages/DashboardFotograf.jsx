import React, { useEffect, useState } from "react";
import axios from "axios";

const DashboardFotograf = () => {
  const [file, setFile] = useState(null);
  const [albumTitle, setAlbumTitle] = useState("");
  const [contests, setContests] = useState([]);
  const [contestId, setContestId] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUserName(userData.full_name);
    }

    const fetchContests = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/contests");
        setContests(res.data);
      } catch (err) {
        console.error("❌ Eroare la încărcarea concursurilor:", err);
      }
    };

    fetchContests();
  }, []);

  const handleUpload = async () => {
    const token = localStorage.getItem("token");

    if (!file || file.length === 0) {
      alert("Alege cel puțin o imagine!");
      return;
    }

    const selectedContest = contests.find(c => c.id === contestId);
    const contestName = selectedContest ? selectedContest.name : "";

    for (let i = 0; i < file.length; i++) {
      const formData = new FormData();
      formData.append("file", file[i]);
      formData.append("album_title", albumTitle);
      formData.append("contest_id", contestId);
      formData.append("contest_name", contestName); // 👈 important pentru backend

      try {
        const res = await axios.post("http://127.0.0.1:8000/upload-photo", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("✅ Răspuns upload:", res.data);
      } catch (err) {
        console.error("❌ Eroare la upload:", err);
      }
    }
  };

  return (
    <div>
      <h2>Salut, {userName}!</h2>

      <div>
        <label>Selectează un concurs:</label>
        <select
          onChange={(e) => setContestId(Number(e.target.value))}
          value={contestId}
        >
          <option value="">-- Alege un concurs --</option>
          {contests.map((contest) => (
            <option key={contest.id} value={contest.id}>
              {contest.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Titlu album:</label>
        <input
          type="text"
          value={albumTitle}
          onChange={(e) => setAlbumTitle(e.target.value)}
        />
      </div>

      <div>
        <label>Selectează poze:</label>
        <input type="file" multiple onChange={(e) => setFile(e.target.files)} />
      </div>

      <button onClick={handleUpload}>Încarcă</button>
    </div>
  );
};

export default DashboardFotograf;
