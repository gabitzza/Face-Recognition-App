import React, { useState, useEffect } from "react";
import axios from "axios";
import './dashboard.css';
import { Home, Calendar, ImageIcon, Heart, LogOut } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import '../assets/fonts/fonts.css';

const DashboardAlergator = () => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [matchResults, setMatchResults] = useState([]);
  const [activeTab, setActiveTab] = useState("match");
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [favoritePhotos, setFavoritePhotos] = useState([]);
  const [favoriteOpen, setFavoriteOpen] = useState(false);
  const [favoriteIndex, setFavoriteIndex] = useState(0);



  useEffect(() => {
    axios.get("http://127.0.0.1:8000/contests")
      .then(res => setContests(res.data))
      .catch(err => console.error("Eroare la preluare concursuri:", err));
  }, []);

  useEffect(() => {
    if (activeTab === "gallery") {
      const token = localStorage.getItem("token");
      axios.get("http://127.0.0.1:8000/my-matches", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
        .then(res => setGalleryPhotos(res.data.matched_photos))
        .catch(err => console.error("Eroare la galeria mea:", err));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "favorites") {
      const token = localStorage.getItem("token");
      axios.get("http://127.0.0.1:8000/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
        .then(res => setFavoritePhotos(res.data.favorites))
        .catch(err => console.error("Eroare la favorite:", err));
    }
  }, [activeTab]);


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

  const handleSave = async (imagePath) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Trebuie să fii logat.");
      return;
    }

    // ✅ verificăm dacă poza e deja în galerie
    if (galleryPhotos.includes(imagePath)) {
      alert("✅ Această poză este deja în galeria ta.");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/save-to-gallery", {
        image_path: imagePath
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert("✔️ Imagine salvată în galeria ta!");
      setGalleryPhotos(prev => [...prev, imagePath]); // ⬅️ actualizăm galeria local
    } catch (err) {
      console.error("❌ Eroare la salvare:", err);
      alert("A apărut o problemă.");
    }
  };

  const handleAddToFavorites = async (imagePath) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Trebuie să fii logat.");
      return;
    }
  
    // ✅ verificare locală dacă poza e deja în lista de favorite
    if (favoritePhotos.includes(imagePath)) {
      alert("✅ Această poză este deja la favorite.");
      return;
    }
  
    try {
      await axios.post("http://127.0.0.1:8000/add-to-favorites", {
        image_path: imagePath
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert("⭐ Adăugat la favorite!");
      setFavoritePhotos(prev => [...prev, imagePath]); // opțional: actualizează local
    } catch (err) {
      console.error("❌ Eroare la favorite:", err);
      if (err.response?.status === 409) {
        alert("Poza este deja la favorite.");
      } else {
        alert("A apărut o problemă.");
      }
    }
  };
  

  const handleRemoveFromFavorites = async (imagePath) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Trebuie să fii logat.");
      return;
    }

    try {
      await axios.delete("http://127.0.0.1:8000/remove-from-favorites", {
        data: { image_path: imagePath },
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      alert("💔 Eliminat din favorite!");
      setFavoritePhotos(prev => prev.filter(path => path !== imagePath));
      setFavoriteOpen(false); // ← închide lightbox-ul după ștergere
    } catch (err) {
      console.error("❌ Eroare la ștergere:", err);
      alert("Nu s-a putut elimina poza.");
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
              <label htmlFor="contest">Selectează evenimentul:</label>
              <select
                id="contest"
                value={selectedContest}
                onChange={(e) => setSelectedContest(e.target.value)}
              >
                <option value="">-- alege un eveniment --</option>
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

        {activeTab === "favorites" && (
          <section className="results">
            <h2>Poze favorite</h2>
            {favoritePhotos.length > 0 ? (
              <div className="gallery">
                {favoritePhotos.map((imgPath, index) => (
                  <img
                    key={index}
                    src={`http://127.0.0.1:8000/uploads/${imgPath}`}
                    alt="Poza favorită"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setFavoriteOpen(true);
                      setFavoriteIndex(index);
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted">Nu ai poze favorite.</p>
            )}
          </section>
        )}


        {activeTab === "gallery" && (
          <section className="results">
            <h2>Galeria mea</h2>
            {galleryPhotos.length > 0 ? (
              <div className="gallery">
                {galleryPhotos.map((imgPath, index) => (
                  <img
                    key={index}
                    src={`http://127.0.0.1:8000/uploads/${imgPath}`}
                    alt="Poza salvată"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setGalleryOpen(true);
                      setGalleryIndex(index);
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted">Nu ai poze salvate în galerie.</p>
            )}
          </section>
        )}

        <Lightbox
          open={open}
          close={() => setOpen(false)}
          index={index}
          slides={matchResults.map((imgPath) => ({
            src: `http://127.0.0.1:8000/uploads/${imgPath}`,
          }))}
          render={{
            slideFooter: () => (
              <div className="lightbox-actions">
                <button
                  className="save-to-gallery"
                  onClick={() => handleSave(matchResults[index])}
                >
                  💾 Salvează în galerie
                </button>

                <button
                  className="add-to-favorite"
                  onClick={() => handleAddToFavorites(matchResults[index])}
                >
                  🤍 Adaugă la favorite
                </button>
              </div>
            )
          }}
        />
        <Lightbox
          open={galleryOpen}
          close={() => setGalleryOpen(false)}
          index={galleryIndex}
          slides={galleryPhotos.map((imgPath) => ({
            src: `http://127.0.0.1:8000/uploads/${imgPath}`,
          }))}
          render={{
            slideFooter: () => (
              <div className="lightbox-actions">
                <button
                  className="add-to-favorite"
                  onClick={() => handleAddToFavorites(galleryPhotos[galleryIndex])}
                >
                  🤍 Adaugă la favorite
                </button>
              </div>
            )
          }}
        />


        <Lightbox
          open={favoriteOpen}
          close={() => setFavoriteOpen(false)}
          index={favoriteIndex}
          slides={favoritePhotos.map((imgPath) => ({
            src: `http://127.0.0.1:8000/uploads/${imgPath}`,
          }))}
          render={{
            slideFooter: () => (
              <div className="lightbox-actions">
                <button
                  className="remove-from-favorite"
                  onClick={() => handleRemoveFromFavorites(favoritePhotos[favoriteIndex])}
                >
                  💔 Scoate din favorite
                </button>
              </div>
            )
          }}
        />

      </main>
    </div>
  );
};

export default DashboardAlergator;