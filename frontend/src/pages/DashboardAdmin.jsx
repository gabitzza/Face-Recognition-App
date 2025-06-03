// src/DashboardAdmin.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import '../assets/fonts/fonts.css';

const DashboardAdmin = () => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [contests, setContests] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/contests")
      .then(res => setContests(res.data))
      .catch(err => console.error("Eroare la preluare concursuri:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("date", date);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      await axios.post("http://127.0.0.1:8000/contests", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Concurs adăugat cu succes!");
      setName("");
      setDate("");
      setImageFile(null);

      const refreshed = await axios.get("http://127.0.0.1:8000/contests");
      setContests(refreshed.data);
    } catch (error) {
      console.error("Eroare la adăugare:", error);
      alert("Eroare la adăugarea concursului.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Adaugă un nou eveniment</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label>Nume eveniment:</label><br />
          <input
            type="text"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <label>Data evenimentului:</label><br />
          <input
            type="date"
            value={date}
            required
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <label>Imagine afiș:</label><br />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </div>
        <button type="submit" style={{ marginTop: "1rem" }}>
          Adaugă eveniment
        </button>
      </form>

      <hr style={{ margin: "2rem 0" }} />

      <h3>Evenimente existente:</h3>
      <ul>
        {contests.map((contest) => (
          <li key={contest.id} style={{ marginBottom: "1rem" }}>
            <strong>{contest.name}</strong> – {contest.date}
            {contest.image_path && (
              <div>
                <img
                  src={`http://127.0.0.1:8000/${contest.image_path}`}
                  alt="afis"
                  style={{ width: "150px", marginTop: "0.5rem" }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardAdmin;
