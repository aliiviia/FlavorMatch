import {
  IconHeadphones,
  IconMusic,
  IconUsers,
} from "@tabler/icons-react";


// src/pages/RecipeDetails.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipeInfo, setRecipeInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [playlistId, setPlaylistId] = useState(null);

  const [isFavorite, setIsFavorite] = useState(false);

  const spotifyToken = localStorage.getItem("spotify_token");

  /* ---------------- FAVORITES: LOAD ---------------- */
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    const exists = favs.some((f) => String(f.id) === String(id));
    setIsFavorite(exists);
  }, [id]);

  /* ---------------- FAVORITES: TOGGLE ---------------- */
  const toggleFavorite = () => {
    if (!recipeInfo) return;

    let favs = JSON.parse(localStorage.getItem("favorites")) || [];
    const exists = favs.some((f) => String(f.id) === String(id));

    if (exists) {
      favs = favs.filter((f) => String(f.id) !== String(id));
      setIsFavorite(false);
    } else {
      const difficulty =
        recipeInfo.readyInMinutes <= 15
          ? "Easy"
          : recipeInfo.readyInMinutes <= 40
          ? "Medium"
          : "Hard";

      favs.push({
        id: recipeInfo.id,
        title: recipeInfo.title,
        image: recipeInfo.image,
        time: `${recipeInfo.readyInMinutes} min`,
        difficulty,
        tags: recipeInfo.cuisines || [],
      });
      setIsFavorite(true);
    }

    localStorage.setItem("favorites", JSON.stringify(favs));
  };

  /* ---------------- FETCH RECIPE + MUSIC ---------------- */
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const recipeRes = await fetch(
          `http://127.0.0.1:5001/api/recipeInfo?id=${id}`
        );
        const recipe = await recipeRes.json();
        setRecipeInfo(recipe);

        // use cuisine (or fallback) for music pairing
        const cuisine = recipe.cuisine || recipe.cuisines?.[0] || "chill";

        const recRes = await fetch("http://127.0.0.1:5001/api/recommendations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${spotifyToken}`,
          },
          body: JSON.stringify({ cuisine }),
        });

        const recData = await recRes.json();
        const tracks = recData.tracks || [];
        setRecommendedTracks(tracks);

        if (tracks.length > 0) {
          const random = tracks[Math.floor(Math.random() * tracks.length)];
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

  /* ---------------- CREATE PLAYLIST ---------------- */
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
      const userRes = await fetch("http://127.0.0.1:5001/me", {
        headers: { Authorization: `Bearer ${spotifyToken}` },
      });
      const user = await userRes.json();

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

  /* ---------------- LOADING STATES ---------------- */
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

  /* ---------------- MAIN UI ---------------- */
  return (
    <main className="recipe-page">
      <div className="recipe-page-inner">
        {/* Back link */}
        <button className="back-btn" onClick={() => navigate(-1)} type="button">
          ← Back to recipes
        </button>

        {/* HEADER AREA – matches screenshot */}
        <header className="recipe-header">
          <h1 className="recipe-title-main">{recipeInfo.title}</h1>

          <div className="recipe-header-meta-row">
            <button
              type="button"
              className={`details-fav-btn ${isFavorite ? "is-favorite" : ""}`}
              onClick={toggleFavorite}
            >
              {isFavorite ? "❤ Remove Favorite" : "♡ Add Favorite"}
            </button>

            {recipeInfo.readyInMinutes && (
              <span className="recipe-meta-pill">
                ⏱ {recipeInfo.readyInMinutes} minutes
              </span>
            )}
            {recipeInfo.servings && (
              <span className="recipe-meta-pill">
                <IconUsers size={16} stroke={1.5} />
                {recipeInfo.servings} servings
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

        {/* 2-COLUMN LAYOUT */}
        <section className="recipe-layout">
          {/* LEFT COLUMN: image + cards */}
          <div className="recipe-main-column">
            {/* Big image card */}
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
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((step, idx) => (
                      <li key={idx} className="instruction-item">
                        <span className="instruction-number">{idx + 1}</span>
                        <p className="instruction-text">{step}</p>
                      </li>
                    ))}
                </ol>
              ) : (
                <p className="instruction-text">No instructions provided.</p>
              )}
            </article>
          </div>

          {/* RIGHT COLUMN: Music Pairing card */}
          <aside className="recipe-side-column">
            <article className="recipe-card music-card">
              <div className="music-card-header">
                <h2 className="recipe-section-heading music-heading">
                  <IconHeadphones size={20} stroke={1.8} />
                  Music Pairing
                </h2>
                <p className="music-subtitle">
                  A song selected to match this recipe’s vibe.
                </p>
              </div>

              {selectedTrack ? (
                <div className="music-recommendations">
                  <div className="music-track-card small">
                    <div className="music-track-info">
                      <p className="music-track-title">{selectedTrack.name}</p>
                      <p className="music-track-artist">
                        {selectedTrack.artists.map((a) => a.name).join(", ")}
                      </p>
                    </div>

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
                <p className="music-subtitle">No recommendations found.</p>
              )}

              <div className="music-actions">
                <button
                  type="button"
                  className="music-primary-btn"
                  onClick={handleMakePlaylist}
                >
                 <IconMusic size={18} stroke={1.8} />
                    Generate Spotify Playlist

                </button>
              </div>

              {playlistId && (
                <div className="playlist-embed-wrapper" style={{ marginTop: 18 }}>
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
