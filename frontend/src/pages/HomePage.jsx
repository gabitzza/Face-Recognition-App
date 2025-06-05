import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './homePage.css';

const HomePage = () => {
  const [contests, setContests] = useState([]);
  const videoRef = useRef(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/contests')
      .then(res => setContests(res.data))
      .catch(err => console.error('Eroare la preluare concursuri:', err));
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.currentTime >= 10) {
        video.currentTime = 10;
        video.pause();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
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
          <a href="/login" className="login-link">Log In</a>
          <a href="/register" className="register-link">Register</a>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <video
          className="hero-video-bg"
          ref={videoRef}
          src="/src/assets/images/videowallpaper.mp4"
          autoPlay
          muted
          playsInline
        />
        <div className="hero-overlay"></div>
        <h1>Explorează evenimentele sportive din România</h1>
        <p>Înscrie-te, încarcă poze sau caută-te în galerie cu recunoaștere facială.</p>
      </header>

      {/* STATISTICS SECTION - mutat imediat sub HERO */}
      <section className="stats-section">
  <div className="stats-container">
    <div className="stats-intro">
      <h2>Get your event<br />LIVE with us!</h2>
      <p>Marathon Photos Live is world leading in event sports photography.</p>
      <button className="stats-btn">ORGANISERS<br />CONTACT US NOW!</button>
    </div>
    <div className="stats-items">
      <div className="stats-item">
        <div className="stats-icon">
          {/* Globe SVG */}
          <svg width="80" height="75" fill="none" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" stroke="#00e6e6" strokeWidth="3"/><ellipse cx="24" cy="24" rx="8" ry="20" stroke="#00e6e6" strokeWidth="3"/><line x1="4" y1="24" x2="44" y2="24" stroke="#00e6e6" strokeWidth="3"/></svg>
        </div>
        <div className="stats-number">70</div>
        <div className="stats-label">Operating in 70<br />Countries</div>
      </div>
      <div className="stats-item">
        <div className="stats-icon">
          {/* Camera SVG */}
          <svg width="80" height="75" fill="none" viewBox="0 0 48 48"><rect x="8" y="14" width="32" height="24" rx="4" stroke="#00e6e6" strokeWidth="3"/><circle cx="24" cy="26" r="7" stroke="#00e6e6" strokeWidth="3"/><rect x="18" y="10" width="12" height="6" rx="2" stroke="#00e6e6" strokeWidth="3"/></svg>
        </div>
        <div className="stats-number">200</div>
        <div className="stats-label">Over 200 Million<br />Images</div>
      </div>
      <div className="stats-item">
        <div className="stats-icon">
          {/* Winner SVG */}
          <svg width="80" height="75" fill="none" viewBox="0 0 48 48"><circle cx="24" cy="18" r="6" stroke="#00e6e6" strokeWidth="3"/><path d="M24 24V38" stroke="#00e6e6" strokeWidth="3"/><path d="M24 38L16 44" stroke="#00e6e6" strokeWidth="3"/><path d="M24 38L32 44" stroke="#00e6e6" strokeWidth="3"/><path d="M18 28L24 24L30 28" stroke="#00e6e6" strokeWidth="3"/></svg>
        </div>
        <div className="stats-number">8</div>
        <div className="stats-label">Over 8 Thousand<br />Events</div>
      </div>
    </div>
  </div>
</section>

      {/* EVENIMENTE VIITOARE */}
      <section>
        <h2>Evenimente viitoare</h2>
        <div className="event-grid">
          {futureContests.map(contest => (
            <div className="event-card" key={contest.id}>
              <img src={`http://127.0.0.1:8000/${contest.image_path}`} alt={contest.name} />
              <div className="event-info">
                <div className="event-title">{contest.name}</div>
                <div className="event-date">{new Date(contest.date).toLocaleDateString()}</div>
              </div>
              <div className="event-card-footer">
                <span>Detalii</span>
                <span className="event-action">
                  {/* Icon coș (SVG) */}
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#016FB9"/>
                    <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
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
