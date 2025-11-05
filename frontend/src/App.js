import { useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Loading backend...");
  const [recipe, setRecipe] = useState("");
  const [data, setData] = useState(null);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const handleSearch = async () => {
    setMessage("Fetching song...");
    setShowPlaylist(false);
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
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <p>
              <strong>Cuisine:</strong> {data.cuisine}
            </p>
            <p>
              <strong>Genre:</strong> {data.genre}
            </p>
            <p>
              <strong>Random Song:</strong>{" "}
              {data.randomTrack.name} – {data.randomTrack.artists.join(", ")}
            </p>

            {/* Embed the chosen song onto the website */}
            <iframe
              src={getTrackEmbedUrl(data.randomTrack.url)}
              width="300"
              height="80"
              frameBorder="0"
              allow="encrypted-media"
              title="Spotify Player"
              style={{
                marginTop: "10px",
                borderRadius: "12px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              }}
            ></iframe>
            
            {/* Button to toggle a playlist view */}
            <div style={{ marginTop: "20px" }}>
              <button onClick={() => setShowPlaylist(!showPlaylist)}>
                {showPlaylist ? "Hide Playlist" : "Generate Playlist"}
              </button>
            </div>

            {/* Display the playlist if toggled */}
            {showPlaylist && (
              <div style={{ marginTop: "20px" }}>
                <h3>Your FlavorMatch Playlist</h3>
                {data.playlist.map((track, index) => (
                  <div key={index} style={{ marginBottom: "15px" }}>
                    <iframe
                      src={getTrackEmbedUrl(track.url)}
                      width="300"
                      height="80"
                      frameBorder="0"
                      allow="encrypted-media"
                      title={`track-${index}`}
                      style={{
                        borderRadius: "12px",
                        boxShadow: "0 1px 6px rgba(0,0,0,0.15)",
                      }}
                    ></iframe>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {data && data.error && (
          <p style={{ color: "red" }}>{data.error}</p>
        )}
      </header>
    </div>
  );
}


export default App;
