// src/pages/CustomRecipePage.js
import { useNavigate } from "react-router-dom";

export default function CustomRecipePage() {
  const navigate = useNavigate();

  return (
    <main className="custom-page">
      <div className="custom-page-inner">

        {/* HEADER */}
        <header className="custom-header">
          <p className="custom-eyebrow">Your creations</p>

          <h1 className="custom-title">Custom Recipes</h1>

          <p className="custom-subtitle">
            Save your own dishes, pair them with music, and explore what you
            (and your friends) have cooked up.
          </p>
        </header>

        {/* OPTION CARDS */}
        <section className="custom-cards">

          {/* CREATE CARD */}
          <article className="custom-card">
            <div className="custom-card-icon">🍳</div>

            <h2 className="custom-card-title">Create a new recipe</h2>

            <p className="custom-card-text">
              Add your own recipe with ingredients, instructions, an image,
              and let FlavorMatch find the perfect soundtrack to match.
            </p>

            <button
              className="custom-card-btn custom-card-btn-primary"
              onClick={() => navigate("/create")}
            >
              ➕ Create recipe
            </button>
          </article>

          {/* EXPLORE CARD */}
          <article className="custom-card">
            <div className="custom-card-icon">📖</div>

            <h2 className="custom-card-title">Explore custom recipes</h2>

            <p className="custom-card-text">
              Browse all user-created dishes, search by name or cuisine,
              and revisit your saved creations anytime.
            </p>

            <button
              className="custom-card-btn custom-card-btn-secondary"
              onClick={() => navigate("/explore")}
            >
              🔍 View custom recipes
            </button>
          </article>

        </section>

        {/* EMPTY STATE */}
        <div className="custom-empty-state">
          No custom recipes yet. Click <strong>“Create a new recipe”</strong> to get started!
        </div>

      </div>
    </main>
  );
}
