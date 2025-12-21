import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authHeader } from "../services/auth";

const API_BASE = process.env.REACT_APP_API_URL;

export default function Watchlist() {
  const [items, setItems] = useState([]);
  const [map, setMap] = useState({});

  useEffect(() => {
    fetch(`${API_BASE}/watchlist`, { headers: authHeader() })
      .then(r => r.json())
      .then(d => {
        setItems(d);
        d.forEach(w =>
          fetch(`https://api.jikan.moe/v4/anime/${w.anime_id}`)
            .then(r => r.json())
            .then(j => setMap(m => ({ ...m, [w.anime_id]: j.data })))
        );
      });
  }, []);

  return (
    <div className="home">
      <h1>Your Watchlist</h1>
      <div className="anime-grid">
        {items.map(w => {
          const a = map[w.anime_id];
          if (!a) return null;
          return (
            <Link key={w.anime_id} to={`/anime/${w.anime_id}`} className="anime-card">
              <img src={a.images?.jpg?.image_url} alt={a.title} />
              <div className="anime-info"><h3>{a.title}</h3></div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}



