// src/DashboardAdmin.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const DashboardAdmin = () => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [contests, setContests] = useState([]); 

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/contests")
      .then(res => setContests(res.data))
      .catch(err => console.error("Eroare la preluare concursuri:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/contests", {
        name,
        date,
      });
      alert("Concurs adăugat cu succes!");
      setName("");
      setDate("");
      console.log(response.data);
      const refreshed = await axios.get("http://127.0.0.1:8000/contests");
      setContests(refreshed.data);
    } catch (error) {
      console.error("Eroare la adăugare:", error);
      alert("Eroare la adăugarea concursului.");
    }
    
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Adaugă un nou concurs</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nume concurs:</label><br />
          <input
            type="text"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <label>Data concursului:</label><br />
          <input
            type="date"
            value={date}
            required
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <button type="submit" style={{ marginTop: "1rem" }}>
          Adaugă concurs
        </button>
      </form>

      <hr style={{ margin: "2rem 0" }} />

      <h3>Concursuri existente:</h3>
      <ul>
        {contests.map((contest) => (
          <li key={contest.id}>
            <strong>{contest.name}</strong> – {contest.date}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardAdmin;