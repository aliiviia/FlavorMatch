import { useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Loading backend...");
  const [recipe, setRecipe] = useState("");
  const [data, setData] = useState(null);

  const handleSearch = async () => {
    setMessage("Fetching song...");
    try {
      const res = await fetch(`http://localhost:5001/api/songForRecipe?recipe=${encodeURIComponent(recipe)}`);
      const json = await res.json();
      setData(json);
      setMessage("Success!");
    } catch (err) {
      console.error("Error:", err);
      setMessage("Failed to fetch song");
    }
  };

  const getTrackEmbedUrl = (url) => {
    const trackId = url.split("/track/")[1];
    return `https://open.spotify.com/embed/track/${trackId}`;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>FlavorMatch</h1>
        <p>{message}</p>

        <input
          type="text"
          value={recipe}
          onChange={(e) => setRecipe(e.target.value)}
          placeholder="Enter a recipe name..."
        />
        <button onClick={handleSearch}>Find Song</button>

        {data && !data.error && (
          <div style={{ marginTop: "20px", textAlign: "left" }}>
            <p><strong>Cuisine:</strong> {data.cuisine}</p>
            <p><strong>Genre:</strong> {data.genre}</p>
            <p><strong>Random Song:</strong> {data.randomTrack.name} – {data.randomTrack.artists.join(", ")}</p>
            <a href={data.randomTrack.url} target="_blank" rel="noreferrer">Open in Spotify</a>
          </div>
        )}

        {data && data.error && <p style={{ color: "red" }}>{data.error}</p>}
      </header>
    </div>
  );
}

export default App;
