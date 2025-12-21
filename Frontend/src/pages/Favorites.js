import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authHeader } from "../services/auth";

const API_BASE = process.env.REACT_APP_API_URL;

export default function Favorites() {
  const [items, setItems] = useState([]);
  const [map, setMap] = useState({});

  useEffect(() => {
    fetch(`${API_BASE}/favorites`, { headers: authHeader() })
      .then(r => r.json())
      .then(d => {
        setItems(d);
        d.forEach(f =>
          fetch(`https://api.jikan.moe/v4/anime/${f.anime_id}`)
            .then(r => r.json())
            .then(j => setMap(m => ({ ...m, [f.anime_id]: j.data })))
        );
      });
  }, []);

  async function removeFavorite(id) {
    await fetch(`${API_BASE}/favorites/${id}`, { method: "DELETE", headers: authHeader() });
    setItems(p => p.filter(x => x.anime_id !== id));
  }

  return (
    <div className="home">
      <h1>Your Favorites</h1>
      <div className="anime-grid">
        {items.map(f => {
          const a = map[f.anime_id];
          if (!a) return null;
          return (
            <div key={f.anime_id} className="anime-card-wrapper">
              <Link to={`/anime/${f.anime_id}`} className="anime-card">
                <img src={a.images?.jpg?.image_url} alt={a.title} />
                <div className="anime-info"><h3>{a.title}</h3></div>
              </Link>
              <button onClick={() => removeFavorite(f.anime_id)}>Remove</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
