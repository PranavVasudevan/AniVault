import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authHeader } from "../services/auth";

const API_BASE = process.env.REACT_APP_API_URL;

export default function AnimeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [anime, setAnime] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [watchStatus, setWatchStatus] = useState("");
  const [journal, setJournal] = useState("");
  const [rating, setRating] = useState("");

  useEffect(() => {
    fetch(`https://api.jikan.moe/v4/anime/${id}`)
      .then(r => r.json())
      .then(j => setAnime(j.data));
  }, [id]);

  async function toggleFavorite() {
    if (isFavorite) {
      await fetch(`${API_BASE}/favorites/${id}`, { method: "DELETE", headers: authHeader() });
      setIsFavorite(false);
    } else {
      await fetch(`${API_BASE}/favorites/${id}`, { method: "POST", headers: authHeader() });
      setIsFavorite(true);
    }
  }

  async function updateWatchlist(status) {
    setWatchStatus(status);
    await fetch(`${API_BASE}/watchlist/${id}`, { method: "POST", headers: authHeader() });
  }

  async function saveJournal() {
    await fetch(`${API_BASE}/journal/${id}?content=${encodeURIComponent(journal)}&rating=${rating || ""}`, {
      method: "POST",
      headers: authHeader(),
    });
    alert("Journal saved");
  }

  if (!anime) return null;

  return (
    <div className="detail-page">
      <button onClick={() => navigate(-1)}>← Back</button>
      <h1>{anime.title}</h1>
      <button onClick={toggleFavorite}>{isFavorite ? "Remove Favorite" : "Add Favorite"}</button>
      <select value={watchStatus} onChange={e => updateWatchlist(e.target.value)}>
        <option value="">Add to Watchlist</option>
        <option value="planned">Planned</option>
        <option value="watching">Watching</option>
        <option value="completed">Completed</option>
        <option value="dropped">Dropped</option>
      </select>
      <textarea value={journal} onChange={e => setJournal(e.target.value)} />
      <input type="number" value={rating} onChange={e => setRating(e.target.value)} />
      <button onClick={saveJournal}>Save Journal</button>
    </div>
  );
}







