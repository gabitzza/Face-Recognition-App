import React, { useEffect, useRef, useState, useMemo } from 'react';
import axios from 'axios';
import './homePage.css';

const sortByDate = (a, b) => new Date(a.date) - new Date(b.date);

const ContestCarousel = ({ contests }) => {
  const sorted = useMemo(() => [...contests].sort(sortByDate), [contests]);
  const [centerIdx, setCenterIdx] = useState(() => {
    // Cel mai apropiat concurs de azi
    const now = new Date();
    let idx = sorted.findIndex(c => new Date(c.date) >= now);
    if (idx === -1) idx = 0;
    return idx;
  });
  const [direction, setDirection] = useState(null);

  const handleLeft = () => {
    setDirection('left');
    setCenterIdx(i => (i === 0 ? sorted.length - 1 : i - 1));
  };

  const handleRight = () => {
    setDirection('right');
    setCenterIdx(i => (i === sorted.length - 1 ? 0 : i + 1));
  };

  return (
    <div className="carousel-container">
      <button className="carousel-btn left" onClick={handleLeft}>&lt;</button>
      <div className="carousel-track">
        {sorted.map((contest, idx) => {
          // offset circular
          let offset = idx - centerIdx;
          const half = Math.floor(sorted.length / 2);
          if (offset > half) offset -= sorted.length;
          if (offset < -half) offset += sorted.length;
          if (Math.abs(offset) > 2) return null;
          return (
            <div
              key={contest.id}
              className={`carousel-card${offset === 0 ? " center" : ""}${offset === 0 && direction ? ` slide-${direction}` : ""}`}
              style={{
                transform: `
                  translateX(${offset * 210}px)
                  scale(${
                    offset === 0
                      ? 1.1
                      : Math.abs(offset) === 1
                      ? 0.8
                      : 0.6
                  })
                  perspective(550px)
                  rotateY(${offset * 10}deg)
                  translateZ(${offset === 0 ? 0 : 60}px)
                `,
                zIndex: 10 - Math.abs(offset),
                opacity: Math.abs(offset) > 2 ? 0 : 1,
                cursor: offset === 0 && contest.website_url ? "pointer" : "default"
              }}
              onClick={() => {
                if (offset === 0 && contest.website_url) {
                  window.open(contest.website_url, "_blank", "noopener,noreferrer");
                }
              }}
            >
              <img src={`http://127.0.0.1:8000/${contest.image_path}`} alt={contest.name} />
              <div className="carousel-card-info">
                <div className="carousel-card-title">{contest.name}</div>
                <div className="carousel-card-date">{new Date(contest.date).toLocaleDateString()}</div>
                {contest.website_url && (
                  <a
                    href={contest.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="carousel-card-link"
                    onClick={e => e.stopPropagation()}
                  >
                    Vezi site
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <button className="carousel-btn right" onClick={handleRight}>&gt;</button>
    </div>
  );
};

const PastContestsSlider = ({ contests }) => {
  const [centerIdx, setCenterIdx] = useState(0);
  const [direction, setDirection] = useState(null);

  if (!contests.length) return null;

  const showCount = 3;
  const half = Math.floor(showCount / 2);

  const handleLeft = () => {
    setDirection('left');
    setCenterIdx(i => (i === 0 ? contests.length - 1 : i - 1));
  };

  const handleRight = () => {
    setDirection('right');
    setCenterIdx(i => (i === contests.length - 1 ? 0 : i + 1));
  };

  // Pentru a afișa mereu 3 carduri, circular
  const getOffset = idx => {
    let offset = idx - centerIdx;
    if (offset > contests.length / 2) offset -= contests.length;
    if (offset < -contests.length / 2) offset += contests.length;
    return offset;
  };

  return (
    <div className="carousel-container">
      <button className="carousel-btn left" onClick={handleLeft}>&lt;</button>
      <div className="carousel-track">
        {contests.map((contest, idx) => {
          const offset = getOffset(idx);
          if (Math.abs(offset) > half) return null;
          return (
            <div
              key={contest.id}
              className={
                "carousel-card" +
                (offset === 0 ? " center" : "") +
                (offset === 0 && direction ? ` slide-${direction}` : "")
              }
              style={{
                transform: `
                  translateX(${offset * 330}px)
                  scale(${offset === 0 ? 1.1 : 0.8})
                  perspective(550px)
                  rotateY(${offset * 2}deg)
                  translateZ(${offset === 0 ? 0 : 80}px)
                `,
                zIndex: 10 - Math.abs(offset),
                opacity: 1,
                transition: "transform 0.5s cubic-bezier(.4,0,.2,1), opacity 0.3s"
              }}
            >
              <img src={`http://127.0.0.1:8000/${contest.image_path}`} alt={contest.name} />
              <div className="carousel-card-info">
                <div className="carousel-card-title">{contest.name}</div>
                <div className="carousel-card-date">{new Date(contest.date).toLocaleDateString()}</div>
                {contest.website_url && (
                  <a
                    href={contest.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="carousel-card-link"
                    onClick={e => e.stopPropagation()}
                  >
                    Vezi site
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <button className="carousel-btn right" onClick={handleRight}>&gt;</button>
    </div>
  );
};

const HomePage = () => {
  const [contests, setContests] = useState([]);
  const videoRef = useRef(null);
  const statsRef = useRef(null);
  const contestsRef = useRef();
  const [statsVisible, setStatsVisible] = useState(false);
  const [contestsVisible, setContestsVisible] = useState(false);

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

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => setContestsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    if (contestsRef.current) observer.observe(contestsRef.current);
    return () => observer.disconnect();
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

      {/* STATISTICS SECTION */}
      <section
        className={`stats-section${statsVisible ? " visible" : ""}`}
        ref={statsRef}
      >
        <div className="stats-container">
          <div className="stats-intro">
            <h2>Fă-ți evenimentul<br />LIVE cu noi!</h2>
            <p>Marathon Photos Live este lider mondial în fotografia sportivă de eveniment.</p>
            <button className="stats-btn">ORGANIZATORI<br />CONTACTAȚI-NE ACUM!</button>
          </div>
          <div className="stats-items">
            <div className="stats-item">
              <div className="stats-icon">
                {/* Globe SVG */}
                <svg width="48" height="48" fill="none" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" stroke="#00e6e6" strokeWidth="3"/><ellipse cx="24" cy="24" rx="8" ry="20" stroke="#00e6e6" strokeWidth="3"/><line x1="4" y1="24" x2="44" y2="24" stroke="#00e6e6" strokeWidth="3"/></svg>
              </div>
              <div className="stats-number">70</div>
              <div className="stats-label">Prezent în 70<br />de țări</div>
            </div>
            <div className="stats-item">
              <div className="stats-icon">
                {/* Camera SVG */}
                <svg width="48" height="48" fill="none" viewBox="0 0 48 48"><rect x="8" y="14" width="32" height="24" rx="4" stroke="#00e6e6" strokeWidth="3"/><circle cx="24" cy="26" r="7" stroke="#00e6e6" strokeWidth="3"/><rect x="18" y="10" width="12" height="6" rx="2" stroke="#00e6e6" strokeWidth="3"/></svg>
              </div>
              <div className="stats-number">200</div>
              <div className="stats-label">Peste 200 de milioane<br />de imagini</div>
            </div>
            <div className="stats-item">
              <div className="stats-icon">
                {/* Winner SVG */}
                <svg width="48" height="48" fill="none" viewBox="0 0 48 48"><circle cx="24" cy="18" r="6" stroke="#00e6e6" strokeWidth="3"/><path d="M24 24V38" stroke="#00e6e6" strokeWidth="3"/><path d="M24 38L16 44" stroke="#00e6e6" strokeWidth="3"/><path d="M24 38L32 44" stroke="#00e6e6" strokeWidth="3"/><path d="M18 28L24 24L30 28" stroke="#00e6e6" strokeWidth="3"/></svg>
              </div>
              <div className="stats-number">8</div>
              <div className="stats-label">Peste 8 mii<br />de evenimente</div>
            </div>
          </div>
        </div>
      </section>

      {/* EVENIMENTE VIITOARE */}
      <section
        className={`contests-section${contestsVisible ? " visible" : ""}`}
        ref={contestsRef}
      >
        <div className="contests-title-svg">
          <svg width="600" height="100">
            <defs>
              <path id="curve" d="M60,60 Q300,10 540,60" />
            </defs>
            <text width="600" style={{ fontSize: '2.7rem', fontWeight: 800, fill: '#fff', letterSpacing: '2px' }}>
              <textPath xlinkHref="#curve" startOffset="0%">
                Evenimente viitoare
              </textPath>
            </text>
          </svg>
        </div>
        <ContestCarousel contests={futureContests} />
      </section>

      {/* SECTIUNE NOUA INTRE EVENIMENTE */}
      <section className="custom-middle-section">
        <div className="custom-middle-content">
          <h2>Descoperă experiența PhotoMatch</h2>
          <p>
            Fie că ești alergător, organizator sau fotograf, platforma noastră îți oferă instrumente moderne pentru a trăi și împărtăși fiecare moment al evenimentului sportiv.
          </p>
        </div>
      </section>

      {/* EVENIMENTE ANTERIOARE */}
      <section style={{ marginTop: '4rem' }}>
        <h2 className="contests-title">Evenimente anterioare</h2>
        <PastContestsSlider contests={pastContests} />
      </section>
    </div>
  );
};

export default HomePage;
