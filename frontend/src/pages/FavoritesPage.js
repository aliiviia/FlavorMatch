import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [pairings, setPairings] = useState([]);

  /* -------------------------------------------
      LOAD FAVORITES ON MOUNT
  -------------------------------------------- */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favorites")) || [];
    setPairings(saved);
  }, []);

  /* -------------------------------------------
      REMOVE FAVORITE
  -------------------------------------------- */
  const handleRemove = (id) => {
    const updated = pairings.filter((p) => p.id !== id);
    setPairings(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  return (
    <main className="favorites-page">
      <div className="favorites-container">
        <header className="favorites-header">
          <div className="header-icon">🎵</div>
          <h1 className="favorites-title">
            Your <span className="title-green">Favorites</span>
          </h1>
          <p className="favorites-subtitle">
            All your saved recipes in one place.
          </p>
        </header>

        {/* If empty */}
        {pairings.length === 0 && (
          <p className="favorites-empty">You have no favorites yet ❤️</p>
        )}

        {/* Cards */}
        <section className="pairings-section">
          <div className="pairings-list">
            {pairings.map((item) => (
              <article key={item.id} className="pairing-card">
                <div
                  className="pairing-content"
                  onClick={() => navigate(`/recipe/${item.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="pairing-image"
                  />

                  <div className="pairing-info">
                    <h3 className="pairing-title">{item.title}</h3>
                    <p className="pairing-sub">
                      {item.time} • {item.difficulty}
                    </p>

                    {item.tags?.length > 0 && (
                      <div className="pairing-tags">
                        {item.tags.map((tag) => (
                          <span key={tag} className="pairing-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pairing-actions">
                  <button
                    className="action-btn"
                    onClick={() => handleRemove(item.id)}
                    title="Remove from favorites"
                  >
                    ❌
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
