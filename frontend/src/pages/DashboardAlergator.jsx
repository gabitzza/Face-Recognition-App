import React, { useState, useEffect } from "react";
import axios from "axios";

const DashboardAlergator = () => {
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [matchResults, setMatchResults] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/contests")
      .then(res => setContests(res.data))
      .catch(err => console.error("Eroare la preluare concursuri:", err));
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedContest) {
      alert("Selectează un concurs și o poză.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("contest_id", selectedContest);

    try {
      const res = await axios.post("http://127.0.0.1:8000/match-photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setMatchResults(res.data.matches); // presupunem că backendul returnează { matches: [...] }
    } catch (err) {
      console.error("Eroare la upload/match:", err);
      alert("Eroare la încărcarea pozei.");
    }
  };

  return (
    <div>
      <h2>Bun venit, alergător!</h2>

      {/* Selectare concurs */}
      <label htmlFor="contestSelect">Selectează concursul:</label>
      <select
        id="contestSelect"
        value={selectedContest}
        onChange={(e) => setSelectedContest(e.target.value)}
      >
        <option value="">-- alege un concurs --</option>
        {contests.map((contest) => (
          <option key={contest.id} value={contest.id}>
            {contest.name}
          </option>
        ))}
      </select>

      {/* Upload poză */}
      <div style={{ marginTop: "20px" }}>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!selectedFile || !selectedContest}>
          Caută poze cu mine
        </button>
      </div>

      {/* Rezultate match */}
      {matchResults.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Poze potrivite:</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {matchResults.map((imgPath, index) => (
              <img
                key={index}
                src={`http://127.0.0.1:8000/uploads/${imgPath}`}
                alt="Poza potrivită"
                width="200"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAlergator;
