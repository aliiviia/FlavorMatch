import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipeInfo, setRecipeInfo] = useState(null);
  const [songData, setSongData] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Fetch recipe info from spoonacular
        const recipeRes = await fetch(`http://localhost:5001/api/recipeInfo?id=${id}`);
        const recipe = await recipeRes.json();
        setRecipeInfo(recipe);

        // Fetch song and potential playlist preview from spotify
        const songRes = await fetch(
          `http://localhost:5001/api/songForRecipe?recipe=${encodeURIComponent(recipe.title)}`
        );
        const song = await songRes.json();
        setSongData(song);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching recipe details:", err);
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const getTrackEmbedUrl = (url) => {
    const trackId = url.split("/track/")[1];
    return `https://open.spotify.com/embed/track/${trackId}`;
  };

  const handleMakePlaylist = async () => {
    if (songData?.playlist?.length) {
      setPlaylist(songData.playlist.slice(0, 10)); //display the top 10 songs as a playlist
      setShowPlaylist(true);
    } else {
      alert("No playlist found.");
    }
  };

  if (loading) return <p>Loading recipe...</p>;
  if (!recipeInfo) return <p>Recipe not found.</p>;

  return (
    <div className="App">
      <header className="App-header">
        <button
          onClick={() => navigate(-1)}
          style={{
            backgroundColor: "transparent",
            color: "#1db954",
            border: "1px solid #1db954",
            borderRadius: "6px",
            padding: "6px 10px",
            marginBottom: "20px",
            cursor: "pointer",
          }}
        >
          ← Back to Results
        </button>

        <h2>{recipeInfo.title}</h2>

        <img
          src={recipeInfo.image}
          alt={recipeInfo.title}
          style={{ width: "60%", borderRadius: "12px", marginTop: "10px" }}
        />

        <div
          dangerouslySetInnerHTML={{ __html: recipeInfo.summary }}
          style={{ marginTop: "15px", color: "#ccc", maxWidth: "600px" }}
        />

        <h3 style={{ marginTop: "20px" }}>Ingredients:</h3>
        <ul style={{ textAlign: "left", maxWidth: "500px", margin: "0 auto" }}>
          {recipeInfo.extendedIngredients?.map((i, index) => (
            <li key={index}>{i}</li>
          ))}
        </ul>

        <h3 style={{ marginTop: "20px" }}>Instructions:</h3>
        <p style={{ maxWidth: "600px" }}>
          {recipeInfo.instructions || "No instructions provided."}
        </p>

        {/* 🎶 Matching Song */}
        {songData && songData.randomTrack && (
          <div style={{ marginTop: "30px" }}>
            <h3>
              Matching Song:{" "}
              <span style={{ color: "#1db954" }}>
                {songData.randomTrack.name}
              </span>
            </h3>
            <p>By {songData.randomTrack.artists.join(", ")}</p>

            {/* Single song embed */}
            <iframe
              src={getTrackEmbedUrl(songData.randomTrack.url)}
              width="320"
              height="80"
              frameBorder="0"
              allow="encrypted-media"
              title="Spotify Player"
              style={{
                marginTop: "10px",
                borderRadius: "12px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
              }}
            ></iframe>

            {/* 🟢 Make Playlist Button */}
            <button
              onClick={handleMakePlaylist}
              style={{
                marginTop: "20px",
                backgroundColor: "#1db954",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "10px 16px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              🎧 Make Playlist
            </button>

            {/* Display the playlist when "make playlist" is clicked  */}
            {showPlaylist && playlist.length > 0 && (
              <div
                style={{
                  marginTop: "30px",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  padding: "15px",
                  width: "350px",
                  textAlign: "center",
                }}
              >
                <h3 style={{ color: "#1db954" }}>Top 10 Playlist</h3>
                {playlist.map((track, index) => {
                  const trackId = track.url.split("/track/")[1];
                  if (!trackId) return null;
                  return (
                    <div
                      key={index}
                      style={{
                        marginTop: "10px",
                        paddingBottom: "10px",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <p style={{ margin: "6px 0", color: "#fff" }}>
                        <strong>{track.name}</strong>
                        <br />
                        <span style={{ color: "#aaa" }}>
                          {track.artists.join(", ")}
                        </span>
                      </p>
                      <iframe
                        src={`https://open.spotify.com/embed/track/${trackId}`}
                        width="300"
                        height="80"
                        allow="encrypted-media"
                        title={`track-${index}`}
                        style={{
                          borderRadius: "12px",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                        }}
                      ></iframe>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default RecipeDetails;