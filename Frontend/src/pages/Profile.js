import { useEffect, useState } from "react";
import { authHeader } from "../services/auth";


const API_BASE = import.meta.env.VITE_API_URL;


export default function Profile() {
  const [journals, setJournals] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/journal`, {
      headers: authHeader(),
    })
      .then(r => r.json())
      .then(setJournals);
  }, []);

  return (
    <div className="page">
      <h1>Your Journal</h1>

      {journals.map(j => (
        <div key={j.id} className="journal-card">
          <p>{j.content}</p>
          {j.rating && <span>Rating: {j.rating}/10</span>}
        </div>
      ))}
    </div>
  );
}
