// src/pages/ContestPage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const ContestPage = () => {
  const { slug } = useParams();
  const [contest, setContest] = useState(null);

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/contest-by-slug/${slug}`)
      .then(res => setContest(res.data))
      .catch(() => setContest(null));
  }, [slug]);

  if (!contest) return <p>Concursul nu a fost găsit.</p>;

  return (
    <div>
      <h1>{contest.name}</h1>
      <p>{new Date(contest.date).toLocaleDateString()}</p>
      {contest.image_path && (
        <img src={`http://127.0.0.1:8000/${contest.image_path}`} alt="afis concurs" />
      )}
    </div>
  );
};

export default ContestPage;
