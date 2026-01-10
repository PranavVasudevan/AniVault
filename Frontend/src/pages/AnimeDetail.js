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
    fetchAnime();
    checkFavorite();
    checkWatchlist();
  }, [id]);

  async function fetchAnime() {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
    const json = await res.json();
    setAnime(json.data);
  }

  async function checkFavorite() {
    const res = await fetch(`${API_BASE}/favorites`, { headers: authHeader() });
    const data = await res.json();
    setIsFavorite(data.some(f => f.anime_id === Number(id)));
  }

  async function toggleFavorite() {
    if (!anime) return;

    if (isFavorite) {
      await fetch(`${API_BASE}/favorites/${anime.mal_id}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      setIsFavorite(false);
    } else {
      await fetch(`${API_BASE}/favorites`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({
          anime_id: anime.mal_id,
          anime_title: anime.title,
          anime_image: anime.images?.jpg?.image_url,
        }),
      });
      setIsFavorite(true);
    }
  }

  async function checkWatchlist() {
    const res = await fetch(`${API_BASE}/watchlist`, { headers: authHeader() });
    const data = await res.json();
    const entry = data.find(w => w.anime_id === Number(id));
    if (entry) setWatchStatus(entry.status);
  }

  async function updateWatchlist(status) {
    setWatchStatus(status);
    await fetch(`${API_BASE}/watchlist`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify({ anime_id: Number(id), status }),
    });
  }

  async function saveJournal() {
    if (!journal.trim()) return;

    await fetch(`${API_BASE}/journal`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify({
        anime_id: Number(id),
        content: journal,
        rating: rating ? Number(rating) : null,
      }),
    });
    alert("Journal saved");
  }

  if (!anime) return null;

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="detail-layout">
        <div className="detail-poster">
          <img src={anime.images?.jpg?.large_image_url} alt={anime.title} />
        </div>

        <div className="detail-main">
          <h1>{anime.title}</h1>
          <p className="rating">★ {anime.score ?? "N/A"}</p>

          <div className="detail-actions">
            <button className="primary" onClick={toggleFavorite}>
              {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </button>

            <select value={watchStatus} onChange={e => updateWatchlist(e.target.value)}>
              <option value="">Add to Watchlist</option>
              <option value="planned">Planned</option>
              <option value="watching">Watching</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>

          <p className="synopsis">{anime.synopsis}</p>
        </div>
      </div>

      <div className="detail-journal">
        <h3>Your Journal</h3>
        <textarea placeholder="Write your thoughts…" value={journal} onChange={e => setJournal(e.target.value)} />
        <input type="number" min="1" max="10" placeholder="Rating" value={rating} onChange={e => setRating(e.target.value)} />
        <button className="danger" onClick={saveJournal}>Save Journal</button>
      </div>
    </div>
  );
}








