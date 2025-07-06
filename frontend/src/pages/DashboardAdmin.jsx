// src/DashboardAdmin.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import '../assets/fonts/fonts.css';
import './dashboard.css';

const DashboardAdmin = () => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [contests, setContests] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedDate, setUpdatedDate] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [url, setUrl] = useState("");
  const [updatedUrl, setUpdatedUrl] = useState("");
  const [pending, setPending] = useState([]);
  const [activeTab, setActiveTab] = useState("add-contest");

  useEffect(() => {
    axios.get("api/contests")
      .then(res => setContests(res.data))
      .catch(err => console.error("Eroare la preluare concursuri:", err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("api/auth/pending-photographers", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setPending(res.data))
      .catch(err => console.error("Eroare la preluare fotografi neaprobați:", err));
  }, []);

  const handleApprove = (id) => {
    const token = localStorage.getItem("token");
    axios.patch(`api/auth/approve-photographer/${id}`, null, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => setPending(pending.filter(p => p.id !== id)))
      .catch(err => console.error("Eroare la aprobare:", err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("date", date);
    const slug = name.toLowerCase().replace(/\s+/g, "");
    formData.append("url", slug);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      await axios.post("api/contests", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Concurs adăugat cu succes!");
      setName("");
      setDate("");
      setImageFile(null);

      const refreshed = await axios.get("api/contests");
      setContests(refreshed.data);
    } catch (error) {
      console.error("Eroare la adăugare:", error);
      alert("Eroare la adăugarea concursului.");
    }
  };

  const handleAddToFavorites = async (imagePath) => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Trebuie să fii logat.");
    return;
  }

  if (favoritePhotos.includes(imagePath)) {
    alert("✅ Această poză este deja la favorite.");
    return;
  }

  try {
    await axios.post("api/add-to-favorites", {
      image_path: imagePath
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    alert("⭐ Adăugat la favorite!");
    setFavoritePhotos(prev => [...prev, imagePath]);
  } catch (err) {
    console.error("❌ Eroare la favorite:", err);
    alert("A apărut o problemă.");
  }
};
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h1 className="logo">FaceApp Admin</h1>
        <nav>
          <ul>
            <li
              className={activeTab === "add-contest" ? "active" : ""}
              onClick={() => setActiveTab("add-contest")}
            >
               Adaugă concursuri
            </li>
            <li
              className={activeTab === "existing-contests" ? "active" : ""}
              onClick={() => setActiveTab("existing-contests")}
            >
               Concursuri existente
            </li>
            <li
              className={activeTab === "approve-accounts" ? "active" : ""}
              onClick={() => setActiveTab("approve-accounts")}
            >
               Aprobă conturi
            </li>
            <li
              className="logout"
              onClick={() => {
                
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
            >
              <span style={{ marginRight: 6 }}>🚪</span> Logout
            </li>
          </ul>
        </nav>
      </aside>

      <main className="content">
        {activeTab === "add-contest" && (
          <section>
            <h2 className="header">Adaugă un nou concurs</h2>
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

              <div style={{ marginTop: "1rem" }}>
                <label>URL site oficial:</label><br />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://exemplu.ro"
                />
              </div>

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
          </section>
        )}

        {activeTab === "existing-contests" && (
          <section>
            <h2 className="header">Concursuri existente</h2>
            <ul className="gallery">
              {contests.map((contest) => (
                <li key={contest.id}>
                  {contest.image_path && (
                    <img src={`api/${contest.image_path}`} alt="afis" />
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
                        <div>
                          <label>URL site oficial:</label><br />
                          <input
                            type="url"
                            value={updatedUrl}
                            onChange={(e) => setUpdatedUrl(e.target.value)}
                            placeholder="https://exemplu.ro"
                          />
                        </div>
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
                            formData.append("url", updatedUrl);
                            if (newImage) {
                              formData.append("image", newImage);
                            }

                            try {
                              await axios.put(`api/contests/${contest.id}`, formData, {
                                headers: { "Content-Type": "multipart/form-data" },
                              });

                              const refreshed = await axios.get("api/contests");
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
                          Salvează
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
                            setUpdatedUrl(contest.url || "");
                          }}
                        >
                          Editează
                        </button>

                        <button
                          className="delete-button"
                          onClick={async () => {
                            if (window.confirm("Ești sigur că vrei să ștergi acest concurs?")) {
                              try {
                                await axios.delete(`api/contests/${contest.id}`);
                                setContests(contests.filter(c => c.id !== contest.id));
                              } catch (err) {
                                alert("Eroare la ștergerea concursului.");
                                console.error(err);
                              }
                            }
                          }}
                        >
                          Șterge
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <hr style={{ margin: "2rem 0" }} />
          </section>
        )}

        {activeTab === "approve-accounts" && (
          <section>
            <h2 className="header">Aprobă conturi noi</h2>
            {pending.length === 0 ? (
              <p>Nu există cereri noi.</p>
            ) : (
              pending.map(p => (
                <div key={p.id} className="pending-user">
                  <p><strong>{p.full_name}</strong> - {p.email}</p>
                  <button onClick={() => handleApprove(p.id)}>Aprobă</button>
                </div>
              ))
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default DashboardAdmin;
