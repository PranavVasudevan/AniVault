import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout, authHeader } from "../services/auth";

const API_BASE = import.meta.env.VITE_API_URL;


function dedupe(list) {
  const map = new Map();
  list.forEach(a => a?.mal_id && map.set(a.mal_id, a));
  return Array.from(map.values());
}

export default function AnimeHome() {
  const navigate = useNavigate();
  const observer = useRef(null);

  const [anime, setAnime] = useState([]);
  const [aiAnime, setAiAnime] = useState([]);

  const [page, setPage] = useState(1);
  const [genre, setGenre] = useState("");
  const [search, setSearch] = useState("");

  const [mode, setMode] = useState("home");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    if (mode !== "home") return;
    fetchHome();
  }, [page, genre, mode]);

  async function fetchHome() {
    if (loading || !hasMore) return;
    setLoading(true);

    const params = new URLSearchParams({ page });
    if (genre) params.append("genre", genre);

    const res = await fetch(`${API_BASE}/anime?${params}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      setHasMore(false);
    } else {
      setAnime(prev => dedupe([...prev, ...data]));
    }
    setLoading(false);
  }

  async function handleSearch() {
    if (!search.trim()) return;

    setMode("search");
    setAnime([]);
    setAiAnime([]);
    setHasMore(false);
    setLoading(true);

    const res = await fetch(
      `${API_BASE}/anime/search?q=${encodeURIComponent(search)}`
    );
    const data = await res.json();
    setAnime(Array.isArray(data) ? dedupe(data) : []);
    setLoading(false);
  }

  async function loadAIRecommendations() {
  setMode("ai");
  setAnime([]);
  setAiAnime([]);
  setAiLoading(true);

  try {
    const res = await fetch(`${API_BASE}/ai/recommend`, {
      headers: authHeader(),
    });
    const data = await res.json();

    if (!Array.isArray(data.titles)) {
      setAiAnime([]);
      setAiLoading(false);
      return;
    }

    //  PARALLEL FETCH 
    const requests = data.titles.map(title =>
      fetch(`${API_BASE}/anime/search?q=${encodeURIComponent(title)}`)
        .then(r => r.json())
        .then(j => j?.[0])
        .catch(() => null)
    );

    const results = await Promise.all(requests);

    // remove nulls + duplicates
    const unique = new Map();
    results.filter(Boolean).forEach(a => {
      unique.set(a.mal_id, a);
    });

    setAiAnime(Array.from(unique.values()));
  } catch (e) {
    console.error("AI recommend failed", e);
    setAiAnime([]);
  }

  setAiLoading(false);
}


  function goHome() {
  setMode("home");
  setSearch("");
  setAiAnime([]);

  setAnime([]);        
  setPage(1);
  setHasMore(true);

  //  FORCE HOME FETCH 
  setTimeout(() => {
    fetchHome();
  }, 0);
}


  const lastAnimeRef = node => {
    if (loading || mode !== "home") return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(e => {
      if (e[0].isIntersecting && hasMore) {
        setPage(p => p + 1);
      }
    });
    node && observer.current.observe(node);
  };

  const list = mode === "ai" ? aiAnime : anime;

  return (
    <div className="home">
      <nav className="navbar">
        <h2>AniAtlas</h2>
        <div>
          <button onClick={() => navigate("/favorites")}>Favorites</button>
          <button onClick={() => navigate("/watchlist")}>Watchlist</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="controls">
        <div className="controls-left">
          <input
            placeholder="Search anime"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>

          <select
            value={genre}
            onChange={e => {
              setGenre(e.target.value);
              setAnime([]);
              setPage(1);
              setHasMore(true);
              setMode("home");
            }}
            disabled={mode !== "home"}
          >
            <option value="">All genres</option>
            <option value="1">Action</option>
            <option value="4">Comedy</option>
            <option value="8">Drama</option>
            <option value="14">Horror</option>
            <option value="22">Romance</option>
            <option value="36">Slice of Life</option>
            <option value="41">Thriller</option>
          </select>
        </div>

        <div className="controls-center">
          <button className="ai-button secondary" onClick={goHome}>
            Home
          </button>
        </div>

        <div className="controls-right">
          <button
            className="ai-button"
            onClick={loadAIRecommendations}
            disabled={aiLoading}
          >
            {aiLoading ? "Finding…" : "Recommend Anime"}
          </button>
        </div>
      </div>

      <div className="content">
  <div className="anime-grid">
    {list.map((a, i) => {
      const year =
        a.aired?.from ? new Date(a.aired.from).getFullYear() : "—";

      const episodes = a.episodes ?? "—";

      const card = (
        <Link to={`/anime/${a.mal_id}`} className="anime-card">
          <div className="anime-image-wrapper">
            <img src={a.images?.jpg?.image_url} alt={a.title} />

            
            <div className="anime-hover">
              <p>Year: {year}</p>
              <p>Episodes: {episodes}</p>
            </div>
          </div>

          <div className="anime-info">
            <h3>{a.title}</h3>
            <span className="rating">★ {a.score ?? "N/A"}</span>
          </div>
        </Link>
      );

      return i === list.length - 1 && mode === "home" ? (
        <div ref={lastAnimeRef} key={a.mal_id}>
          {card}
        </div>
      ) : (
        <div key={a.mal_id}>{card}</div>
      );
    })}
  </div>
</div>


      {loading && <p className="loading">Loading…</p>}
      {!loading && list.length === 0 && <p className="end">No anime found</p>}
    </div>
  );
}

        








