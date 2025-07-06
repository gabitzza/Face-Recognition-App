// src/DashboardAdmin.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import '../assets/fonts/fonts.css';
import './dashboard.css';

const DashboardAdmin = () => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [contests, setContests] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedDate, setUpdatedDate] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [updatedUrl, setUpdatedUrl] = useState("");
  const [pending, setPending] = useState([]);
  const [activeTab, setActiveTab] = useState("add-contest");

  useEffect(() => {
    axios.get("/contests")
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
    const cleanSlug = customUrl.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/[^a-z0-9\-]/g, '');
    formData.append("url", cleanSlug);

    console.log("Trimitem URL:", cleanSlug);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      await axios.post("/contests", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Concurs adăugat cu succes!");
      setName("");
      setDate("");
      setCustomUrl("");
      setImageFile(null);

      const refreshed = await axios.get("/contests");
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
            <li className={activeTab === "add-contest" ? "active" : ""} onClick={() => setActiveTab("add-contest")}>
              Adaugă concursuri
            </li>
            <li className={activeTab === "existing-contests" ? "active" : ""} onClick={() => setActiveTab("existing-contests")}>
              Concursuri existente
            </li>
            <li className={activeTab === "approve-accounts" ? "active" : ""} onClick={() => setActiveTab("approve-accounts")}>
              Aprobă conturi
            </li>
            <li className="logout" onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}>
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

              <label>URL site oficial:</label>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="ex: trofeulcpnt"
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
          </section>
        )}

        {/* celelalte taburi rămân nemodificate */}
      </main>
    </div>
  );
};

export default DashboardAdmin;
