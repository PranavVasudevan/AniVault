import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authHeader } from "../services/auth";
import { isLoggedIn } from "../services/auth";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://anivault-67h4.onrender.com";


export default function Favorites() {
  const [items, setItems] = useState([]);
  const [animeMap, setAnimeMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!isLoggedIn()) return;
  load();
}, []);


  async function load() {
    try {
      const res = await fetch(`${API_BASE}/favorites`, { headers: authHeader() });
      const data = await res.json();
      setItems(data);

      const map = {};
      for (const f of data) {
        const r = await fetch(`https://api.jikan.moe/v4/anime/${f.anime_id}`);
        const j = await r.json();
        map[f.anime_id] = j.data;
      }
      setAnimeMap(map);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }

  async function removeFavorite(id) {
    await fetch(`${API_BASE}/favorites/${id}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    setItems(prev => prev.filter(x => x.anime_id !== id));
  }

  if (loading) return <p className="loading">Loading favorites…</p>;

  return (
    <div className="home">
      <h1 className="section-title">Favorites</h1>


      {items.length === 0 && <p className="end">No favorites yet</p>}

      <div className="content">
        <div className="anime-grid">
          {items.map(f => {
            const a = animeMap[f.anime_id];
            if (!a) return null;

            return (
              <div key={f.anime_id} className="anime-card-wrapper">
                <Link to={`/anime/${f.anime_id}`} className="anime-card">
                  <img src={a.images?.jpg?.image_url} alt={a.title} />
                  <div className="anime-info">
                    <h3>{a.title}</h3>
                    <span className="rating">★ {a.score ?? "N/A"}</span>
                  </div>
                </Link>

                <button className="danger" onClick={() => removeFavorite(f.anime_id)}>
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

