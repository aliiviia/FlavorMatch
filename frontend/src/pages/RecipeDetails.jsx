// src/pages/RecipeDetails.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipeInfo, setRecipeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null); // ⭐ NEW: single random track
  const [playlistId, setPlaylistId] = useState(null);

  const spotifyToken = localStorage.getItem("spotify_token");

  /* ---------------------------------------------------
      FETCH RECIPE INFO + GET RECOMMENDATIONS
  --------------------------------------------------- */
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // (1) Fetch recipe info
        const recipeRes = await fetch(
          `http://127.0.0.1:5001/api/recipeInfo?id=${id}`
        );
        const recipe = await recipeRes.json();
        setRecipeInfo(recipe);

        // (2) Get cuisine returned from backend
        const cuisine = recipe.cuisine;
        console.log("Cuisine detected:", cuisine);

        // (3) Fetch recommended songs from backend
        const recRes = await fetch("http://127.0.0.1:5001/api/recommendations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${spotifyToken}`,
          },
          body: JSON.stringify({ cuisine }),
        });

        const recData = await recRes.json();
        console.log("Recommendation response:", recData);

        const tracks = recData.tracks || [];
        setRecommendedTracks(tracks);

        // (4) Pick one random track to display + embed
        if (tracks.length > 0) {
          const random =
            tracks[Math.floor(Math.random() * tracks.length)];
          setSelectedTrack(random);
        }
      } catch (err) {
        console.error("Error fetching recipe details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, spotifyToken]);

  /* ---------------------------------------------------
      CREATE PLAYLIST
  --------------------------------------------------- */
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
      // (1) Get Spotify user profile
      const userRes = await fetch("http://127.0.0.1:5001/me", {
        headers: { Authorization: `Bearer ${spotifyToken}` },
      });

      const user = await userRes.json();

      // (2) Create playlist
      const playlistRes = await fetch(
        "http://127.0.0.1:5001/api/createPlaylist",
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

      // (3) Add all recommended songs to playlist
      const uris = recommendedTracks.map((t) => t.uri);

      await fetch("http://127.0.0.1:5001/api/addTracks", {
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

  /* ---------------------------------------------------
      LOADING / ERROR
  --------------------------------------------------- */
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

  /* ---------------------------------------------------
      MAIN UI
  --------------------------------------------------- */
  return (
    <main className="recipe-page">
      <div className="recipe-page-inner">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back to recipes
        </button>

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

        <section className="recipe-layout">
          {/* LEFT COLUMN */}
          <div className="recipe-main-column">
            {/* Image */}
            <article className="recipe-card recipe-image-card">
              <img
                src={recipeInfo.image}
                alt={recipeInfo.title}
                className="recipe-main-img"
              />
            </article>

            {/* Ingredients */}
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

            {/* Instructions */}
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
                        <span className="instruction-number">{index + 1}</span>
                        <p className="instruction-text">{step}</p>
                      </li>
                    ))}
                </ol>
              ) : (
                <p>No instructions provided.</p>
              )}
            </article>
          </div>

          {/* RIGHT COLUMN: MUSIC */}
          <aside className="recipe-side-column">
            <article className="recipe-card music-card">
              <h2 className="recipe-section-heading">
                <span className="music-icon">🎵</span> Music Pairing
              </h2>
              <p className="music-subtitle">
                A song selected to match this recipe’s vibe.
              </p>

              {/* RANDOM SONG + EMBED */}
              {selectedTrack ? (
                <div className="music-recommendations">
                  <div className="music-track-card small">
                    <p className="music-track-title">{selectedTrack.name}</p>
                    <p className="music-track-artist">
                      {selectedTrack.artists
                        .map((a) => a.name)
                        .join(", ")}
                    </p>

                    {/* PLAYABLE TRACK */}
                    <iframe
                      src={`https://open.spotify.com/embed/track/${selectedTrack.id}`}
                      width="100%"
                      height="152"
                      style={{ borderRadius: "12px", marginTop: "10px" }}
                      frameBorder="0"
                      allow="encrypted-media"
                      title="spotify-track-player"
                    ></iframe>
                  </div>
                </div>
              ) : (
                <p>No recommendations found.</p>
              )}

              {/* Playlist Button */}
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
