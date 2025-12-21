const API_BASE = "http://127.0.0.1:8000/anime";

export async function fetchAnime({ search = "", mood = "", page = 1 }) {
  const url = `${API_BASE}?search=${encodeURIComponent(search)}&mood=${encodeURIComponent(mood)}&page=${page}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to load anime");
  }

  return await res.json();
}
