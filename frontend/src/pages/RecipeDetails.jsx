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
    const parts = url.split("/track/");
    if (parts.length < 2) return null;
    const rest = parts[1].split("?")[0];
    return `https://open.spotify.com/embed/track/${rest}`;
  };

  const handleMakePlaylist = () => {
    if (songData?.playlist?.length) {
      setPlaylist(songData.playlist.slice(0, 10));
      setShowPlaylist(true);
    } else {
      alert("No playlist found.");
    }
  };

  if (loading) {
    return (
      <main className="recipe-page">
        <div className="recipe-page-inner">
          <p className="recipe-loading">Loading recipe...</p>
        </div>
      </main>
    );
  }

  if (!recipeInfo) {
    return (
      <main className="recipe-page">
        <div className="recipe-page-inner">
          <p className="recipe-loading">Recipe not found.</p>
        </div>
      </main>
    );
  }

  const trackEmbedUrl = songData?.randomTrack
    ? getTrackEmbedUrl(songData.randomTrack.url)
    : null;

  return (
    <main className="recipe-page">
      <div className="recipe-page-inner">
        {/* Top bar */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back to recipes
        </button>

        {/* Header section: title + meta + summary */}
        <header className="recipe-header">
          <h1 className="recipe-title-main">{recipeInfo.title}</h1>

          <div className="recipe-meta-row">
            {recipeInfo.readyInMinutes && (
              <span className="recipe-meta-pill">
                ⏱ {recipeInfo.readyInMinutes} minutes
              </span>
            )}
            {recipeInfo.servings && (
              <span className="recipe-meta-pill">
                👥 {recipeInfo.servings} servings
              </span>
            )}
          </div>

          {recipeInfo.summary && (
            <div
              className="recipe-description"
              dangerouslySetInnerHTML={{ __html: recipeInfo.summary }}
            />
          )}
        </header>

        {/* Main 2-column layout */}
        <section className="recipe-layout">
          {/* LEFT COLUMN: image + ingredients + instructions */}
          <div className="recipe-main-column">
            {/* Big image card */}
            <article className="recipe-card recipe-image-card">
              <img
                src={recipeInfo.image}
                alt={recipeInfo.title}
                className="recipe-main-img"
              />
            </article>

            {/* Ingredients card */}
            <article className="recipe-card">
              <h2 className="recipe-section-heading">Ingredients</h2>
              <ul className="ingredients-list">
                {recipeInfo.extendedIngredients?.map((i, index) => {
                  const text =
                    typeof i === "string"
                      ? i
                      : i.original || i.name || JSON.stringify(i);
                  return (
                    <li key={index} className="ingredient-item">
                      <span className="ingredient-dot" />
                      <span>{text}</span>
                    </li>
                  );
                })}
              </ul>
            </article>

            {/* Instructions card */}
            <article className="recipe-card">
              <h2 className="recipe-section-heading">Instructions</h2>
              {recipeInfo.instructions ? (
                <ol className="instructions-list">
                  {recipeInfo.instructions
                    .split(/\r?\n/)
                    .map((step) => step.trim())
                    .filter(Boolean)
                    .map((step, index) => (
                      <li key={index} className="instruction-item">
                        <span className="instruction-number">
                          {index + 1}
                        </span>
                        <p className="instruction-text">{step}</p>
                      </li>
                    ))}
                </ol>
              ) : (
                <p className="instructions-text">
                  No instructions provided for this recipe.
                </p>
              )}
            </article>
          </div>

          {/* RIGHT COLUMN: music pairing card */}
          <aside className="recipe-side-column">
            <article className="recipe-card music-card">
              <div className="music-card-header">
                <h2 className="recipe-section-heading">
                  <span className="music-icon">🎵</span> Music Pairing
                </h2>
                <p className="music-subtitle">
                  The perfect soundtrack for cooking this recipe.
                </p>
              </div>

              {/* Main matching track */}
              {songData?.randomTrack && (
                <div className="music-track-card">
                  <div className="music-track-info">
                    <p className="music-track-title">
                      {songData.randomTrack.name}
                    </p>
                    <p className="music-track-artist">
                      {songData.randomTrack.artists.join(", ")}
                    </p>
                  </div>

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
                </div>
              )}

              {/* Playlist preview (list of tracks) */}
              {showPlaylist && playlist.length > 0 && (
                <div className="music-playlist-list">
                  {playlist.map((track, index) => {
                    const parts = track.url.split("/track/");
                    if (parts.length < 2) return null;
                    const trackId = parts[1].split("?")[0];

                    return (
                      <div key={index} className="music-track-card small">
                        <div className="music-track-info">
                          <p className="music-track-title">{track.name}</p>
                          <p className="music-track-artist">
                            {track.artists.join(", ")}
                          </p>
                        </div>
                        <iframe
                          src={`https://open.spotify.com/embed/track/${trackId}`}
                          width="100%"
                          height="64"
                          allow="encrypted-media"
                          title={`track-${index}`}
                          className="song-embed"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Actions */}
              <div className="music-actions">
                <button
                  type="button"
                  className="music-primary-btn"
                  onClick={handleMakePlaylist}
                >
                  🎧 Add All to Playlist
                </button>
              </div>
            </article>
          </aside>
        </section>
      </div>
    </main>
  );
}
