// src/pages/FavoritesPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconHeartFilled } from "@tabler/icons-react";
import "../styles/Recipes.css";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    if (!userId) return; // no logged-in user

    async function fetchFavorites() {
      try {
        const res = await fetch(`${API_URL}/favorites/${userId}`);
        const data = await res.json();
        setFavorites(data);
      } catch (err) {
        console.error("Failed to load favorites:", err);
      }
    }

    fetchFavorites();
  }, []);

  const recipeCount =
    favorites.length === 1 ? "1 recipe" : `${favorites.length} recipes`;

  return (
    <main className="favorites-page">
      {/* TOP HEADER */}
      <section className="favorites-hero">
        <div className="favorites-hero-inner">
          <div className="favorites-cover">
            <IconHeartFilled
              className="favorites-cover-icon"
              size={90}
              color="#ffffff"
            />
          </div>

          <div className="favorites-meta">
            <span className="favorites-label">PLAYLIST</span>
            <h1 className="favorites-title-hero">Liked Recipes</h1>
            <p className="favorites-meta-sub">
              FlavorMatch · {recipeCount}
            </p>
          </div>
        </div>
      </section>

      {/* TABLE OF REAL FAVORITES */}
      <section className="favorites-body">
        <div className="favorites-table">
          <div className="favorites-table-header">
            <div>#</div>
            <div>TITLE</div>
            <div>CHEF</div>
            <div>DATE ADDED</div>
            <div className="favorites-time-col">⏱</div>
          </div>

          {favorites.map((item, index) => (
            <div
              key={item.recipe_id}
              className="favorites-row"
              onClick={() => navigate(`/recipe/${item.recipe_id}`)}
            >
              <div className="favorites-col-index">{index + 1}</div>

              <div className="favorites-col-title">
                <img
                  src={item.image}
                  alt={item.title}
                  className="favorites-row-img"
                />
                <div className="favorites-row-text">
                  <p className="favorites-row-title">{item.title}</p>
                  <p className="favorites-row-sub">
                    {item.cuisine || "Recipe"}
                  </p>
                </div>
              </div>

              <div className="favorites-col-chef">
                {item.chef || "Unknown Chef"}
              </div>

              <div className="favorites-col-added">
                {item.added_at?.slice(0, 10) || "Recently"}
              </div>

              <div className="favorites-col-time">
                {item.time || "—"}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
