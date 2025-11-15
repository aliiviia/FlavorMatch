// src/pages/RecipeDetails.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function RecipeDetails() {
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
        // Fetch recipe info from backend (Spoonacular wrapper)
        const recipeRes = await fetch(
          `http://localhost:5001/api/recipeInfo?id=${id}`
        );
        const recipe = await recipeRes.json();
        setRecipeInfo(recipe);

        // Fetch Spotify track + playlist based on recipe title
        const songRes = await fetch(
          `http://localhost:5001/api/songForRecipe?recipe=${encodeURIComponent(
            recipe.title
          )}`
        );
        const song = await songRes.json();
        setSongData(song);
      } catch (err) {
        console.error("Error fetching recipe details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const getTrackEmbedUrl = (url) => {
    if (!url) return null;
    // Handle URLs like https://open.spotify.com/track/ID?si=...
    const parts = url.split("/track/");
    if (parts.length < 2) return null;
    const rest = parts[1].split("?")[0];
    return `https://open.spotify.com/embed/track/${rest}`;
  };

  const handleMakePlaylist = () => {
    if (songData?.playlist?.length) {
      setPlaylist(songData.playlist.slice(0, 10)); // show top 10
      setShowPlaylist(true);
    } else {
      alert("No playlist found.");
    }
  };

  if (loading) {
    return (
      <main className="recipe-page">
        <p className="recipe-loading">Loading recipe...</p>
      </main>
    );
  }

  if (!recipeInfo) {
    return (
      <main className="recipe-page">
        <p className="recipe-loading">Recipe not found.</p>
      </main>
    );
  }

  const trackEmbedUrl = songData?.randomTrack
    ? getTrackEmbedUrl(songData.randomTrack.url)
    : null;

  return (
    <main className="recipe-page">
      <div className="recipe-page-inner">
        {/* Back button */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back to results
        </button>

        {/* Top layout: image + main info */}
        <section className="recipe-hero-row">
          <div className="recipe-image-wrap">
            <img
              src={recipeInfo.image}
              alt={recipeInfo.title}
              className="recipe-main-img"
            />
          </div>

          <div className="recipe-main-info">
            <h1 className="recipe-title">{recipeInfo.title}</h1>

            {recipeInfo.readyInMinutes && (
              <p className="recipe-meta">
                ⏱ Ready in {recipeInfo.readyInMinutes} minutes
              </p>
            )}

            {/* Summary from Spoonacular (HTML) */}
            {recipeInfo.summary && (
              <div
                className="recipe-summary"
                dangerouslySetInnerHTML={{ __html: recipeInfo.summary }}
              />
            )}

            {/* Matching song block */}
            {songData && songData.randomTrack && (
              <div className="recipe-song-card">
                <h2 className="song-heading">
                  Matching Song:{" "}
                  <span className="song-title">
                    {songData.randomTrack.name}
                  </span>
                </h2>
                <p className="song-artists">
                  By {songData.randomTrack.artists.join(", ")}
                </p>

                {trackEmbedUrl && (
                  <iframe
                    src={trackEmbedUrl}
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allow="encrypted-media"
                    title="Spotify Player"
                    className="song-embed"
                  />
                )}

                <button
                  type="button"
                  className="playlist-btn"
                  onClick={handleMakePlaylist}
                >
                  🎧 Make Playlist
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Ingredients + instructions + playlist */}
        <section className="recipe-details-grid">
          <div className="recipe-column">
            <h2 className="recipe-section-heading">Ingredients</h2>
            <ul className="ingredients-list">
              {recipeInfo.extendedIngredients?.map((i, index) => {
                // Spoonacular usually returns objects; fall back if it's already a string
                const text =
                  typeof i === "string"
                    ? i
                    : i.original || i.name || JSON.stringify(i);
                return <li key={index}>{text}</li>;
              })}
            </ul>
          </div>

          <div className="recipe-column">
            <h2 className="recipe-section-heading">Instructions</h2>
            {recipeInfo.instructions ? (
              <p className="instructions-text">{recipeInfo.instructions}</p>
            ) : (
              <p className="instructions-text">No instructions provided.</p>
            )}

            {/* Playlist area */}
            {showPlaylist && playlist.length > 0 && (
              <div className="playlist-panel">
                <h2 className="recipe-section-heading">Top 10 Playlist</h2>
                <div className="playlist-list">
                  {playlist.map((track, index) => {
                    const parts = track.url.split("/track/");
                    if (parts.length < 2) return null;
                    const trackId = parts[1].split("?")[0];

                    return (
                      <div key={index} className="playlist-item">
                        <p className="playlist-track-text">
                          <strong>{track.name}</strong>
                          <br />
                          <span>{track.artists.join(", ")}</span>
                        </p>
                        <iframe
                          src={`https://open.spotify.com/embed/track/${trackId}`}
                          width="100%"
                          height="80"
                          allow="encrypted-media"
                          title={`track-${index}`}
                          className="song-embed"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
