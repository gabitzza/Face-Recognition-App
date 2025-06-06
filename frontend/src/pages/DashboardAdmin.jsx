// src/DashboardAdmin.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import '../assets/fonts/fonts.css';
import './dashboard.css';

const DashboardAdmin = () => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [contests, setContests] = useState([]); const [editingId, setEditingId] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedDate, setUpdatedDate] = useState("");
  const [newImage, setNewImage] = useState(null);


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
    <div className="dashboard">
      <main className="content">
        <h2 className="header">Adaugă un nou eveniment</h2>
        <form className="upload-form" onSubmit={handleSubmit} encType="multipart/form-data">
          <label>Nume eveniment:</label>
          <input
            type="text"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
          />

          <label>Data evenimentului:</label>
          <input
            type="date"
            value={date}
            required
            onChange={(e) => setDate(e.target.value)}
          />

          <label>Imagine afiș:</label>
          <div className="custom-file-input">
            <label htmlFor="fileUpload">Alege imaginea afișului</label>
            <input
              id="fileUpload"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </div>

          <button type="submit">Adaugă eveniment</button>
        </form>

        <hr style={{ margin: "2rem 0" }} />

        <h3>Evenimente existente:</h3>
        <ul className="gallery">
          {contests.map((contest) => (
            <li key={contest.id}>
              {contest.image_path && (
                <img src={`http://127.0.0.1:8000/${contest.image_path}`} alt="afis" />
              )}

              <div className="event-info">
                {editingId === contest.id ? (
                  <>
                    <input
                      type="text"
                      value={updatedName}
                      onChange={(e) => setUpdatedName(e.target.value)}
                      placeholder="Nume concurs"
                    />
                    <input
                      type="date"
                      value={updatedDate}
                      onChange={(e) => setUpdatedDate(e.target.value)}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewImage(e.target.files[0])}
                    />

                    <button
                      onClick={async () => {
                        const formData = new FormData();
                        formData.append("name", updatedName);
                        formData.append("date", updatedDate);
                        if (newImage) {
                          formData.append("image", newImage);
                        }

                        try {
                          await axios.put(`http://127.0.0.1:8000/contests/${contest.id}`, formData, {
                            headers: { "Content-Type": "multipart/form-data" },
                          });

                          const refreshed = await axios.get("http://127.0.0.1:8000/contests");
                          setContests(refreshed.data);
                          setEditingId(null);
                          setUpdatedName("");
                          setUpdatedDate("");
                          setNewImage(null);
                        } catch (err) {
                          alert("Eroare la actualizare.");
                          console.error(err);
                        }
                      }}
                    >
                      💾 Salvează
                    </button>
                    <button onClick={() => setEditingId(null)}>❌ Anulează</button>
                  </>
                ) : (
                  <>
                    <h4 className="event-title">{contest.name}</h4>
                    <p className="event-date">{new Date(contest.date).toLocaleDateString()}</p>

                    <button
                      onClick={() => {
                        setEditingId(contest.id);
                        setUpdatedName(contest.name);
                        setUpdatedDate(contest.date.slice(0, 10));
                      }}
                    >
                      ✏️ Editează
                    </button>

                    <button
                      className="delete-button"
                      onClick={async () => {
                        if (confirm("Ești sigur că vrei să ștergi acest concurs?")) {
                          try {
                            await axios.delete(`http://127.0.0.1:8000/contests/${contest.id}`);
                            setContests(contests.filter(c => c.id !== contest.id));
                          } catch (err) {
                            alert("Eroare la ștergerea concursului.");
                            console.error(err);
                          }
                        }
                      }}
                    >
                      🗑️ Șterge
                    </button>
                  </>
                )}
              </div>
            </li>

          ))}
        </ul>
      </main>
    </div>
  );
};

export default DashboardAdmin;
