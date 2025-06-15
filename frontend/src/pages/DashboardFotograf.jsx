import React, { useEffect, useState } from "react";
import axios from "axios";
import '../assets/fonts/fonts.css';
import './dashboard.css';


const DashboardFotograf = () => {
  const [file, setFile] = useState(null);
  const [albumTitle, setAlbumTitle] = useState("");
  const [contests, setContests] = useState([]);
  const [contestId, setContestId] = useState("");
  const [userName, setUserName] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUserName(userData.full_name);
    }

    const fetchContests = async () => {
      try {
        const res = await axios.get("api/contests");
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

    setUploadMessage("O să dureze câteva momente, așteaptă te rog și nu ieși din aplicație...");

    const selectedContest = contests.find(c => c.id === contestId);
    const contestName = selectedContest ? selectedContest.name : "";

    for (let i = 0; i < file.length; i++) {
      const formData = new FormData();
      formData.append("file", file[i]);
      formData.append("album_title", albumTitle);
      formData.append("contest_id", contestId);
      formData.append("contest_name", contestName);

      try {
        const res = await axios.post("api/upload-photo", formData, {
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

    setUploadMessage("📸 Pozele au fost încărcate. Poți continua.");
  };


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };


  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h1 className="logo">FaceApp</h1>
        <nav>
          <ul>
            <li> Încarcă poze</li>
            <li className="logout" onClick={handleLogout}>
              Logout
            </li>
          </ul>
        </nav>
      </aside>

      <main className="content">
        <h2>Bun venit, {userName}!</h2>

        <div className="upload-form">
          <label>Selectează un eveniment:</label>
          <select
            onChange={(e) => setContestId(Number(e.target.value))}
            value={contestId}
          >
            <option value="">-- Alege un eveniment --</option>
            {contests.map((contest) => (
              <option key={contest.id} value={contest.id}>
                {contest.name}
              </option>
            ))}
          </select>

          <label>Titlu album:</label>
          <input
            type="text"
            value={albumTitle}
            onChange={(e) => setAlbumTitle(e.target.value)}
          />

          <div className="custom-file-input">
            <label htmlFor="fileUpload">Selectează poze</label>
            <input
              id="fileUpload"
              type="file"
              multiple
              onChange={(e) => setFile(e.target.files)}
            />
          </div>

          <button onClick={handleUpload}>Încarcă</button>
        </div>
        {uploadMessage && (
          <p className="upload-msg">{uploadMessage}</p>
        )}

      </main>
    </div>
  );

};

export default DashboardFotograf;
