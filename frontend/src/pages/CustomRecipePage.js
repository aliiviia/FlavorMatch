// src/pages/CustomRecipePage.js
import { useNavigate } from "react-router-dom";

export default function CustomRecipePage() {
  const navigate = useNavigate();

  return (
    <main className="custom-page">
      <div className="custom-page-inner">
        {/* Header */}
        <header className="custom-header">
          <p className="custom-eyebrow">Your creations</p>
          <h1 className="custom-title">Custom Recipes</h1>
          <p className="custom-subtitle">
            Save your own dishes, pair them with music, and explore what you
            (and your friends) have cooked up.
          </p>
        </header>

        {/* Two option cards */}
        <section className="custom-cards">
          {/* Create card */}
          <article className="custom-card">
            <div className="custom-card-icon">✨</div>
            <h2 className="custom-card-title">Create a new recipe</h2>
            <p className="custom-card-text">
              Add your own recipe with ingredients, instructions, an image, and
              let FlavorMatch find the perfect Spotify vibe to go with it.
            </p>
            <button
              type="button"
              className="custom-card-btn custom-card-btn-primary"
              onClick={() => navigate("/create")}
            >
              ➕ Create recipe
            </button>
          </article>

          {/* Explore card */}
          <article className="custom-card">
            <div className="custom-card-icon">📖</div>
            <h2 className="custom-card-title">Explore custom recipes</h2>
            <p className="custom-card-text">
              Browse all custom dishes, search by name or cuisine, and revisit
              your saved creations whenever you’re ready to cook again.
            </p>
            <button
              type="button"
              className="custom-card-btn custom-card-btn-secondary"
              onClick={() => navigate("/explore")}
            >
              🔍 View custom recipes
            </button>
          </article>
        </section>
      </div>
    </main>
  );
}

