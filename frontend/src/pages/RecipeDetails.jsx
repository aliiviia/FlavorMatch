// src/pages/RecipeDetails.jsx
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

  const spotifyToken = localStorage.getItem("spotify_token");

  /* --- FAVORITES - LOAD --- */
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    const exists = favs.some((f) => String(f.id) === String(id));
    setIsFavorite(exists);
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
        tags: recipeInfo.cuisines || [],
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
        setRecipeInfo(recipe);

        const cuisine = recipe.cuisine || "chill";

        const recRes = await fetch(`${API_URL}/api/recommendations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${spotifyToken}`,
          },
          body: JSON.stringify({ cuisine }),
        });

        const recData = await recRes.json();
        setRecommendedTracks(recData.tracks);

        if (recData.tracks.length > 0) {
          const random = recData.tracks[Math.floor(Math.random() * recData.tracks.length)];
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

  /* --- CREATE SPOTIFY PLAYLIST --- */
  const handleMakePlaylist = async () => {
    if (!spotifyToken) return alert("Please log in with Spotify first!");
    if (!recommendedTracks.length) return alert("No recommended tracks!");

    try {
      const userRes = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${spotifyToken}` },
      });
      const user = await userRes.json();

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
      setPlaylistId(playlist.id);

      const uris = recommendedTracks.map((t) => t.uri);

      await fetch(`${API_URL}/api/addTracks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${spotifyToken}`,
        },
        body: JSON.stringify({ playlistId: playlist.id, uris }),
      });

      alert("Playlist created! Scroll down to listen.");
    } catch (err) {
      console.error("Playlist error:", err);
      alert("Could not create playlist.");
    }
  };

  /* --- LOADING STATES --- */
  if (loading) return <p>Loading recipe...</p>;
  if (!recipeInfo) return <p>Recipe not found.</p>;

  /* --- MAIN UI --- */
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

            {recipeInfo.readyInMinutes && (
              <span className="recipe-meta-pill">⏱ {recipeInfo.readyInMinutes} min</span>
            )}
            {recipeInfo.servings && (
              <span className="recipe-meta-pill"><IconUsers size={16} /> {recipeInfo.servings}</span>
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
          <aside className="recipe-side-column">
            <article className="recipe-card music-card">
              <h2 className="recipe-section-heading">
                <IconHeadphones size={20} /> Music Pairing
              </h2>

              {selectedTrack ? (
                <>
                  <p>{selectedTrack.name}</p>
                  <p>{selectedTrack.artists.map((a) => a.name).join(", ")}</p>

                  <iframe
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

              {playlistId && (
                <iframe
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
