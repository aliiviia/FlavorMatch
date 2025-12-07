import { IconHeadphones, IconMusic, IconUsers } from "@tabler/icons-react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipeInfo, setRecipeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [playlistId, setPlaylistId] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [playlistLoading, setPlaylistLoading] = useState(false); // ⭐ NEW

  const spotifyToken = localStorage.getItem("spotify_token");

  console.log("RecipeDetails component rendered");

  // ⭐ UPDATED — THIS DOES NOT TOUCH REACT STATE
  async function waitForEmbedReady(id) {
    for (let i = 0; i < 20; i++) {
      const res = await fetch(
        `https://open.spotify.com/oembed?url=https://open.spotify.com/playlist/${id}`
      );
      const data = await res.json();

      if (data.thumbnail_url) {
        console.log("Spotify embed metadata ready!");
        return true;
      }

      await new Promise((r) => setTimeout(r, 600));
    }

    console.warn("Spotify embed metadata did NOT become ready.");
    return false;
  }

  /* --- FAVORITES - LOAD --- */
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    setIsFavorite(favs.some((f) => String(f.id) === String(id)));
  }, [id]);

  /* --- FAVORITES - TOGGLE --- */
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
        tags: recipeInfo.cuisine ? [recipeInfo.cuisine] : [],
      });

      setIsFavorite(true);
    }

    localStorage.setItem("favorites", JSON.stringify(favs));
  };

  /* --- FETCH RECIPE + MUSIC --- */
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const recipeRes = await fetch(`${API_URL}/api/recipeInfo?id=${id}`);
        const recipe = await recipeRes.json();

        if (!recipe) {
          setRecipeInfo(null);
          return;
        }

        recipe.summary ||= "";
        recipe.instructions ||= "No instructions available.";
        recipe.extendedIngredients ||= [];
        recipe.cuisine ||= "american";
        recipe.steps ||= [];
        recipe.notes ||= "";


        setRecipeInfo(recipe);

        if (!spotifyToken) return;

        const recRes = await fetch(`${API_URL}/api/recommendations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${spotifyToken}`,
          },
          body: JSON.stringify({ cuisine: recipe.cuisine }),
        });

        const recData = await recRes.json();

        setRecommendedTracks(recData.tracks || []);

        if (recData.tracks?.length > 0) {
          const random =
            recData.tracks[Math.floor(Math.random() * recData.tracks.length)];
          setSelectedTrack(random);
        }
      } catch (err) {
        console.error("Error loading recipe:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, spotifyToken]);

  /* --- CREATE PLAYLIST --- */
  const handleMakePlaylist = async () => {
    console.log("=== START handleMakePlaylist ===");
    console.log("recommendedTracks:", recommendedTracks);

    setPlaylistLoading(true); // ⭐ turn on loading
    setPlaylistId(null);      // ⭐ clear old playlist embed

    if (!spotifyToken) {
      setPlaylistLoading(false);
      return alert("Please log in with Spotify first!");
    }
    if (!recommendedTracks.length) {
      setPlaylistLoading(false);
      return alert("No recommended tracks found.");
    }

    try {
      console.log("Fetching Spotify user...");

      const userRes = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${spotifyToken}` },
      });
      const user = await userRes.json();
      console.log("User:", user);

      console.log("Creating playlist...");
      const playlistRes = await fetch(`${API_URL}/api/createPlaylist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${spotifyToken}`,
        },
        body: JSON.stringify({
          userId: user.id,
          recipeTitle: recipeInfo.title,
        }),
      });

      const playlist = await playlistRes.json();
      console.log("Playlist response:", playlist);

      if (!playlist || !playlist.id) {
        setPlaylistLoading(false);
        return alert("Error: Missing playlist ID!");
      }

      const playlistID = playlist.id;
      console.log("Playlist ID:", playlistID);

      console.log("Adding tracks...");
      const uris = recommendedTracks.map((t) => t.uri).filter(Boolean);

      const addTracksRes = await fetch(`${API_URL}/api/addTracks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${spotifyToken}`,
        },
        body: JSON.stringify({ playlistId: playlistID, uris }),
      });
      console.log("Add tracks result:", await addTracksRes.json());

      console.log("Waiting for Spotify embed metadata...");
      const ready = await waitForEmbedReady(playlistID);

      if (!ready) {
        console.warn("Embed not ready; showing anyway.");
      }

      setPlaylistId(playlistID);  // ⭐ show embed
      setPlaylistLoading(false);   // ⭐ stop loading

      console.log("=== END handleMakePlaylist ===");
    } catch (err) {
      console.error("Playlist creation ERROR:", err);
      alert("Could not create playlist.");
      setPlaylistLoading(false);
    }
  };

  /* --- LOADING --- */
  if (loading) return <p>Loading recipe...</p>;
  if (!recipeInfo) return <p>Recipe not found.</p>;

  return (
    <main className="recipe-page">
      <div className="recipe-page-inner">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <header className="recipe-header">
          <h1 className="recipe-title-main">{recipeInfo.title}</h1>

          <div className="recipe-header-meta-row">
            <button
              className={`details-fav-btn ${isFavorite ? "is-favorite" : ""}`}
              onClick={toggleFavorite}
            >
              {isFavorite ? "❤ Remove Favorite" : "♡ Add Favorite"}
            </button>

            <span className="recipe-meta-pill">
              ⏱ {recipeInfo.readyInMinutes} min
            </span>

            <span className="recipe-meta-pill">
              <IconUsers size={16} /> {recipeInfo.servings}
            </span>
          </div>

          <div
            className="recipe-description"
            dangerouslySetInnerHTML={{ __html: recipeInfo.summary }}
          />
        </header>

        <section className="recipe-layout">
          <div className="recipe-main-column">
            <article className="recipe-card recipe-image-card">
              <img
                src={recipeInfo.image}
                alt={recipeInfo.title}
                className="recipe-main-img"
              />
            </article>

            <article className="recipe-card">
              <h2>Ingredients</h2>
              <ul>
                {recipeInfo.extendedIngredients.map((i, idx) => (
                  <li key={idx}>{i}</li>
                ))}
              </ul>
            </article>

            <article className="recipe-card">
              <h2>Instructions</h2>

              {recipeInfo.steps && recipeInfo.steps.length > 0 ? (
                <ol className="instructions-list">
                  {recipeInfo.steps.map((s) => (
                    <li key={s.number}>{s.step}
                    <div className="step-number">{s.number}</div>
                    <div className="step-text">{s.step}</div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: recipeInfo.instructions }} />
              )}
            </article>
            {recipeInfo.notes && (
              <article className="recipe-card">
                <h2>Notes</h2>
                <div
                  className="recipe-notes"
                  dangerouslySetInnerHTML={{ __html: recipeInfo.notes }}
                />
              </article>
            )}


          </div>

          <aside className="recipe-side-column">
            <article className="recipe-card music-card">
              <h2>
                <IconHeadphones size={20} /> Music Pairing
              </h2>

              {selectedTrack ? (
                <>
                  <p>{selectedTrack.name}</p>
                  <p>{selectedTrack.artists.map((a) => a.name).join(", ")}</p>

                  <iframe
                    title="track-embed"
                    src={`https://open.spotify.com/embed/track/${selectedTrack.id}`}
                    width="100%"
                    height="200"
                    style={{ borderRadius: "12px" }}
                  ></iframe>
                </>
              ) : (
                <p>No tracks found.</p>
              )}

              <button className="music-primary-btn" onClick={handleMakePlaylist}>
                <IconMusic size={18} /> Generate Spotify Playlist
              </button>

              {/* ⭐ LOADING UI */}
              {playlistLoading && (
                <div className="playlist-loading">
                  <p>Generating your playlist…</p>
                  <div className="spinner"></div>
                </div>
              )}

              {/* EMBED */}
              {!playlistLoading && playlistId && (
                <iframe
                  title={`playlist-${playlistId}`}
                  src={`https://open.spotify.com/embed/playlist/${playlistId}`}
                  width="100%"
                  height="400"
                  style={{ borderRadius: "12px", marginTop: 12 }}
                ></iframe>
              )}
            </article>
          </aside>
        </section>
      </div>
    </main>
  );
}
