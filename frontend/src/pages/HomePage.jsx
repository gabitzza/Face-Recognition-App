import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './homePage.css';

const HomePage = () => {
  const [contests, setContests] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/contests')
      .then(res => setContests(res.data))
      .catch(err => console.error('Eroare la preluare concursuri:', err));
  }, []);

  const now = new Date();
  const futureContests = contests.filter(c => new Date(c.date) > now);
  const pastContests = contests.filter(c => new Date(c.date) <= now);

  return (
    <div className="homepage-container">
      
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">PhotoMatch</div>
        <div className="auth-links">
          <a href="/login" >Log In</a>
          <a href="/register">Register</a>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <h1>Explorează evenimentele sportive din România</h1>
        <p>Înscrie-te, încarcă poze sau caută-te în galerie cu recunoaștere facială.</p>
      </header>

      {/* EVENIMENTE VIITOARE */}
      <section>
        <h2>Evenimente viitoare</h2>
        <div className="event-grid">
          {futureContests.map(contest => (
            <div className="event-card" key={contest.id}>
              <img src={`http://127.0.0.1:8000/${contest.image_path}`} />
              <div className="event-info">
                <h3 className="event-title">{contest.name}</h3>
                <p className="event-date">{new Date(contest.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EVENIMENTE ANTERIOARE */}
      <section style={{ marginTop: '4rem' }}>
        <h2>Evenimente anterioare</h2>
        <div className="event-grid">
          {pastContests.map(contest => (
            <div className="event-card" key={contest.id}>
              <img src={`http://127.0.0.1:8000/${contest.image_path}`} alt={contest.name} />
              <div className="event-info">
                <h3 className="event-title">{contest.name}</h3>
                <p className="event-date">{new Date(contest.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
