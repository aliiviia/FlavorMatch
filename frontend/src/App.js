import { useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Loading backend...");
  const [recipe, setRecipe] = useState("");
  const [data, setData] = useState(null);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [recipeInfo, setRecipeInfo] = useState(null);

  const handleSearch = async () => {
    setMessage("Fetching song...");
    setShowPlaylist(false);

    try {
      // fetch recipe info
      await fetchRecipeInfo(recipe);
      // fetch spotify song for recipes
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

const fetchRecipeInfo = async (recipe) => {
  try {
    const res = await fetch(`http://localhost:5001/api/recipeInfo?recipe=${encodeURIComponent(recipe)}`);
    const data = await res.json();
    setRecipeInfo(data);
  } catch (err) {
    console.error("Error fetching recipe info:", err);
  }
};


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

        {/* 🍽️ Recipe Info Section */}
        {recipeInfo && (
          <div
            style={{
              marginTop: "30px",
              textAlign: "left",
              maxWidth: "600px",
              margin: "40px auto",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              padding: "20px",
              borderRadius: "12px",
            }}
          >
            <h2>{recipeInfo.title}</h2>
            <img
              src={recipeInfo.image}
              alt={recipeInfo.title}
              style={{
                width: "100%",
                borderRadius: "12px",
                marginTop: "10px",
              }}
            />
            <div
              dangerouslySetInnerHTML={{ __html: recipeInfo.summary }}
              style={{ marginTop: "15px", color: "#ccc" }}
            />
            <h3 style={{ marginTop: "15px" }}>Ingredients:</h3>
            <ul>
              {recipeInfo.ingredients?.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
            <h3 style={{ marginTop: "15px" }}>Instructions:</h3>
            <p>{recipeInfo.instructions}</p>
            <a
              href={recipeInfo.sourceUrl}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#1db954", textDecoration: "none" }}
            >
              View full recipe ↗
            </a>
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
