import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authHeader } from "../services/auth";

const API_BASE = import.meta.env.VITE_API_URL;

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  async function fetchFavorites() {
    const res = await fetch(`${API_BASE}/favorites`, { headers: authHeader() });
    const data = await res.json();
    setFavorites(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function removeFavorite(animeId) {
    await fetch(`${API_BASE}/favorites/${animeId}`, {
      method: "DELETE",
      headers: authHeader(),
    });

    fetchFavorites();   
  }

  if (loading) return <p className="loading">Loading favorites…</p>;

  return (
    <div className="home">
      <h1>Your Favorites</h1>

      {favorites.length === 0 && <p className="end">No favorites yet</p>}

      <div className="content">
        <div className="anime-grid">
          {favorites.map(f => (
            <div key={f.anime_id} className="anime-card-wrapper">
              <Link to={`/anime/${f.anime_id}`} className="anime-card">
                <img src={f.anime_image} alt={f.anime_title} />
                <div className="anime-info">
                  <h3>{f.anime_title}</h3>
                </div>
              </Link>

              <button className="danger" onClick={() => removeFavorite(f.anime_id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
