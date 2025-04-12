import React, { useState, useEffect } from "react";
import axios from "axios";
import './dashboard.css';
import { Home, Calendar, ImageIcon, Heart, LogOut } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const DashboardAlergator = () => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [matchResults, setMatchResults] = useState([]);
  const [activeTab, setActiveTab] = useState("match");

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
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post("http://127.0.0.1:8000/match-photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        }
      });

      setMatchResults(res.data.matches);
    } catch (err) {
      console.error("Eroare la upload/match:", err);
      alert("Eroare la încărcarea pozei.");
    }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h1 className="logo">FaceApp</h1>
        <nav>
          <ul>
            <li className={activeTab === "match" ? "active" : ""} onClick={() => setActiveTab("match")}> <Home size={16} /> Caută poze</li>
            <li className={activeTab === "upcoming" ? "active" : ""} onClick={() => setActiveTab("upcoming")}> <Calendar size={16} /> Concursuri viitoare</li>
            <li className={activeTab === "gallery" ? "active" : ""} onClick={() => setActiveTab("gallery")}> <ImageIcon size={16} /> Galeria mea</li>
            <li className={activeTab === "favorites" ? "active" : ""} onClick={() => setActiveTab("favorites")}> <Heart size={16} /> Poze favorite</li>
            <li className="logout"><LogOut size={16} /> Logout</li>
          </ul>
        </nav>
      </aside>

      <main className="content">
        {activeTab === "match" && (
          <div>
            <header className="header">
              <h2>Caută poze cu tine</h2>
            </header>

            <section className="upload-form">
              <label htmlFor="contest">Selectează concursul:</label>
              <select
                id="contest"
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

              <div className="custom-file-input">
                <label htmlFor="fileUpload">Încarcă o poză</label>
                <input
                  type="file"
                  id="fileUpload"
                  onChange={handleFileChange}
                />
              </div>

              <button
                onClick={handleUpload}
                disabled={!selectedFile || !selectedContest}
              >
                Caută poze cu mine
              </button>
            </section>

            {matchResults.length > 0 ? (
              <section className="results">
                <h3>Poze potrivite:</h3>
                <div className="gallery">
                  {matchResults.map((imgPath, i) => (
                    <img
                      key={i}
                      src={`http://127.0.0.1:8000/uploads/${imgPath}`}
                      alt="Poza potrivită"
                      onClick={() => {
                        setOpen(true);
                        setIndex(i);
                      }}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </div>
              </section>
            ) : selectedFile && (
              <p className="text-muted">Nu am găsit poze potrivite pentru tine la acest concurs.</p>
            )}
          </div>
        )}

        {activeTab === "upcoming" && <h2>Concursuri viitoare – în curând</h2>}
        {activeTab === "gallery" && <h2>Galeria mea – în curând</h2>}
        {activeTab === "favorites" && <h2>Poze favorite – în curând</h2>}
        {open && (
          <Lightbox
            open={open}
            close={() => setOpen(false)}
            index={index}
            slides={matchResults.map((imgPath) => ({
              src: `http://127.0.0.1:8000/uploads/${imgPath}`,
            }))}
          />
        )}

      </main>
    </div>

  );
};

export default DashboardAlergator;