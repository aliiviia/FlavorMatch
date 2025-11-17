// src/pages/RecipeDetails.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipeInfo, setRecipeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [playlistId, setPlaylistId] = useState(null);
  const spotifyToken = localStorage.getItem("spotify_token");

  useEffect(() => {
        const fetchDetails = async () => {
      try {
        // 1) Fetch recipe info
        const recipeRes = await fetch(
          `http://localhost:5001/api/recipeInfo?id=${id}`
        );
        const recipe = await recipeRes.json();
        setRecipeInfo(recipe);

        // 2) Fetch recommendations from Spotify based on cuisine
        const cuisine = recipe.title.toLowerCase().includes("mexican")
          ? "mexican"
          : recipe.title.toLowerCase().includes("italian")
          ? "italian"
          : recipe.title.toLowerCase().includes("japanese")
          ? "japanese"
          : recipe.title.toLowerCase().includes("indian")
          ? "indian"
          : "american";

        const recRes = await fetch(
          "http://localhost:5001/api/recommendations",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${spotifyToken}`,
            },
            body: JSON.stringify({ cuisine }),
          }
        );

        const recData = await recRes.json();
        setRecommendedTracks(recData.tracks || []);
      } catch (err) {
        console.error("Error fetching recipe details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, spotifyToken]);

    // -----------------------------------------------
  // HANDLE PLAYLIST CREATION
  // -----------------------------------------------
  const handleMakePlaylist = async () => {
    if (!spotifyToken) {
      alert("Please log in with Spotify first!");
      return;
    }
    if (!recommendedTracks.length) {
      alert("No recommended tracks to add.");
      return;
    }

    try {
      // Step 1: Get logged-in Spotify user profile
      const userRes = await fetch("http://localhost:5001/me", {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
      });
      const user = await userRes.json();

      // Step 2: Create a new playlist
      const playlistRes = await fetch(
        "http://localhost:5001/api/createPlaylist",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${spotifyToken}`,
          },
          body: JSON.stringify({
            userId: user.id,
            recipeTitle: recipeInfo.title,
          }),
        }
      );

      const playlist = await playlistRes.json();
      setPlaylistId(playlist.id);

      // Step 3: Add recommended tracks to playlist
      const uris = recommendedTracks.map((t) => t.uri);

      await fetch("http://localhost:5001/api/addTracks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${spotifyToken}`,
        },
        body: JSON.stringify({
          playlistId: playlist.id,
          uris,
        }),
      });

      alert("Playlist created! Scroll down to listen.");
    } catch (err) {
      console.error("Error creating playlist:", err);
      alert("Failed to create playlist.");
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
                    .split(/\. +/) 
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

                    {/* RIGHT COLUMN - MUSIC */}
          <aside className="recipe-side-column">
            <article className="recipe-card music-card">
              <h2 className="recipe-section-heading">
                <span className="music-icon">🎵</span> Music Pairing
              </h2>
              <p className="music-subtitle">
                Songs that match the vibe of this cuisine.
              </p>

              {/* Recommended Tracks */}
              {recommendedTracks.length > 0 ? (
                <div className="music-recommendations">
                  {recommendedTracks.slice(0, 6).map((track) => (
                    <div key={track.id} className="music-track-card small">
                      <p className="music-track-title">{track.name}</p>
                      <p className="music-track-artist">
                        {track.artists.map((a) => a.name).join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No recommendations found.</p>
              )}

              {/* Button */}
              <button
                type="button"
                className="music-primary-btn"
                onClick={handleMakePlaylist}
              >
                🎧 Generate Spotify Playlist
              </button>

              {/* Playlist Embed */}
              {playlistId && (
                <div className="playlist-embed-wrapper">
                  <iframe
                    src={`https://open.spotify.com/embed/playlist/${playlistId}`}
                    width="100%"
                    height="400"
                    style={{ borderRadius: "12px" }}
                    frameBorder="0"
                    allow="encrypted-media"
                    title="playlist-player"
                  />
                </div>
              )}
            </article>
          </aside>
        </section>
      </div>
    </main>
  );
}