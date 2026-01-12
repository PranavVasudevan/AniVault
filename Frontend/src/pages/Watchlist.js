import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authHeader } from "../services/auth";
import { isLoggedIn } from "../services/auth";

const API_BASE = process.env.REACT_APP_API_URL


export default function Watchlist() {
  const [entries, setEntries] = useState([]);
  const [animeMap, setAnimeMap] = useState({});
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
    if (!isLoggedIn()) return;
   load();
  }, []);

  async function load() {
    try {
      const res = await fetch(`${API_BASE}/watchlist`, { headers: authHeader() });
      const data = await res.json();
      setEntries(data);

      const map = {};
      for (const w of data) {
        const r = await fetch(`https://api.jikan.moe/v4/anime/${w.anime_id}`);
        const j = await r.json();
        map[w.anime_id] = j.data;
      }
      setAnimeMap(map);
    } catch {
      setEntries([]);
    }
    setLoading(false);
  }

  const filtered = entries.filter(e => filter === "all" || e.status === filter);

  if (loading) return <p className="loading">Loading watchlist…</p>;

  return (
    <div className="home">
      <h1 className="section-title">Watchlist</h1>


      <div className="controls">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="planned">Planned</option>
          <option value="watching">Watching</option>
          <option value="completed">Completed</option>
          <option value="dropped">Dropped</option>
        </select>
      </div>

      {filtered.length === 0 && <p className="end">No anime in this category</p>}

      <div className="content">
        <div className="anime-grid">
          {filtered.map(w => {
            const anime = animeMap[w.anime_id];
            if (!anime) return null;

            return (
              <Link to={`/anime/${w.anime_id}`} key={w.anime_id} className="anime-card">
                <img src={anime.images?.jpg?.image_url} alt={anime.title} />
                <div className="anime-info">
                  <h3>{anime.title}</h3>
                  <span className="badge">{w.status}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

