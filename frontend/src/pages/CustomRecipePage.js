// src/pages/CustomRecipePage.jsx
import { useState, useEffect } from "react";
import heroImg from "../images/create.png";
import box from "../images/123.png";
import fourImg from "../images/4.png";
import "../styles/Custom.css";

const LOCAL_KEY = "customRecipes";
const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function CustomRecipePage() {
  const [recipes, setRecipes] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [showSpotifyPrompt, setShowSpotifyPrompt] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipe, setShowRecipe] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // ⭐ ADDED AI STATE
  const [aiOutput, setAiOutput] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    setRecipes(saved);
  }, []);

  const saveRecipes = (next) => {
    setRecipes(next);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
  };

  const deleteRecipe = (id) => {
    const next = recipes.filter((r) => r.id !== id);
    saveRecipes(next); // updates state + localStorage
  };

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/customRecipes`)
      .then((res) => res.json())
      .then((data) => setRecipes(data))
      .catch((err) => console.error("Failed to load recipes:", err));
  }, []);

  const isSpotifyConnected =
    typeof window !== "undefined" &&
    !!localStorage.getItem("spotify_token");

  const handleCreateClick = () => {
    if (!isSpotifyConnected) {
      setShowSpotifyPrompt(true);
      return;
    }
    setShowCreate(true);
  };

  const handleCollectionClick = () => {
    if (!isSpotifyConnected) {
      setShowSpotifyPrompt(true);
      return;
    }
    setShowCollection(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();

    if (!isSpotifyConnected) {
      setShowCreate(false);
      setShowSpotifyPrompt(true);
      return;
    }

    const newRecipe = {
      id: Date.now(),
      name: name.trim(),
      cuisine: cuisine.trim(),
      prepTime: prepTime.trim(),
      ingredients: ingredients.trim(),
      instructions: instructions.trim(),
      imageUrl: imageUrl.trim(),
      createdAt: new Date().toISOString(),
    };

    const next = [newRecipe, ...recipes];
    saveRecipes(next);

    setName("");
    setCuisine("");
    setPrepTime("");
    setIngredients("");
    setInstructions("");
    setImageUrl("");
    setAiOutput(null); 

    setShowCreate(false);
    setShowCollection(true);
  };

  async function handleImproveWithAI() {
    if (!ingredients.trim() && !instructions.trim()) {
      alert("Please enter ingredients and instructions first.");
      return;
    }

    setLoadingAI(true);
    setAiOutput(null);

    try {
      const res = await fetch(`${API_URL}/api/ai/format-recipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: name,
          ingredients,
          steps: instructions,
        }),
      });

      const data = await res.json();
      setAiOutput(data);
    } catch (err) {
      console.error("AI error:", err);
      alert("AI formatting failed.");
    }

    setLoadingAI(false);
  }

  function applyAIToForm() {
    if (!aiOutput) return;
    if (aiOutput.title) setName(aiOutput.title);
    if (aiOutput.ingredients) setIngredients(aiOutput.ingredients.join("\n"));
    if (aiOutput.instructions) setInstructions(aiOutput.instructions.join("\n"));
  }

  const recipeCount = recipes.length;
  const categoryCount = new Set(
    recipes.map((r) => r.cuisine).filter((c) => c && c.trim().length > 0)
  ).size;

  return (
    <main className="custom-recipes-page">
      {/* HERO */}
      <section className="cr-hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="cr-hero-overlay" />
        <div className="cr-hero-inner">
          <div className="cr-hero-text">
            <p className="cr-issue-label">
              ISSUE NO. <span>01</span>
            </p>

            <div className="cr-hero-heading">
              <span className="cr-hero-heading-line">Custom </span>
              <span className="cr-hero-heading-line cr-hero-heading-line-secondary">
                Recipes
              </span>
            </div>

            <p className="cr-hero-subtitle">
              A curated collection of your personal culinary creations.
            </p>

            {!isSpotifyConnected && (
              <p className="cr-hero-warning">
                Connect your Spotify account to create and save recipes.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* MAIN */}
      <section className="cr-main">
        <div className="cr-main-inner">
          <div className="cr-main-top-row">
            <p className="cr-section-label">FEATURED</p>
            <p className="cr-section-label cr-section-label-right">COLLECTION</p>
          </div>

          <div className="cr-grid">
            <div className="cr-left-column">
              <article
                className={`cr-feature-card ${
                  !isSpotifyConnected ? "cr-feature-card-disabled" : ""
                }`}
                onClick={handleCreateClick}
              >
                <div
                  className="cr-feature-image"
                  style={{ backgroundImage: `url(${fourImg})` }}
                >
                  {!isSpotifyConnected && (
                    <div className="cr-locked-banner">
                      <span>Connect Spotify to unlock</span>
                    </div>
                  )}

                  <div className="cr-feature-overlay" />
                  <div className="cr-feature-content">
                    <button type="button" className="cr-plus-circle">
                      +
                    </button>
                    <h2 className="cr-feature-title">Create New Recipe</h2>
                    <p className="cr-feature-subtitle">
                      Begin your culinary masterpiece
                    </p>
                  </div>
                </div>
              </article>

              <p className="cr-under-create">
                Every great dish begins with inspiration…
              </p>
            </div>

            {/* RIGHT COLUMN */}
            <div className="cr-collection-column">
              <article
                className={`cr-collection-card ${
                  !isSpotifyConnected ? "cr-feature-card-disabled" : ""
                }`}
                onClick={handleCollectionClick}
              >
                <div
                  className="cr-collection-image"
                  style={{ backgroundImage: `url(${box})` }}
                >
                  <div className="cr-collection-overlay" />
                  <div className="cr-collection-content">
                    <h3 className="cr-collection-title">My Collection</h3>
                    <p className="cr-collection-sub">
                      {recipeCount} {recipeCount === 1 ? "recipe" : "recipes"} saved
                    </p>
                  </div>
                </div>
              </article>

              <div className="cr-bottom-right">
                <div className="cr-stats">
                  <div className="cr-stat-item">
                    <span className="cr-stat-number">{recipeCount}</span>
                    <span className="cr-stat-label">RECIPES</span>
                  </div>
                  <div className="cr-stat-divider" />
                  <div className="cr-stat-item">
                    <span className="cr-stat-number">{categoryCount}</span>
                    <span className="cr-stat-label">CATEGORIES</span>
                  </div>
                </div>

                <blockquote className="cr-quote">
                  <p>"Cooking is like music…”</p>
                  <span className="cr-quote-source">— FLAVORMATCH</span>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CREATE MODAL ========== */}
      {showCreate && (
        <div className="cr-modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="cr-modal" onClick={(e) => e.stopPropagation()}>
            <header className="cr-modal-header">
              <div>
                <h2 className="cr-modal-title">Create New Recipe</h2>
                <p className="cr-modal-subtitle">Fill in the details to save your masterpiece.</p>
              </div>
              <button className="cr-modal-close" onClick={() => setShowCreate(false)}>×</button>
            </header>

            <form className="cr-modal-body" onSubmit={handleCreateSubmit}>
              <div className="cr-form-grid">

                <div className="cr-field full">
                  <label className="cr-label">Recipe Name</label>
                  <input
                    className="cr-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="cr-field">
                  <label className="cr-label">Cuisine Type</label>
                  <input
                    className="cr-input"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                  />
                </div>

                <div className="cr-field">
                  <label className="cr-label">Prep Time</label>
                  <input
                    className="cr-input"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                  />
                </div>

                <div className="cr-field full">
                  <label className="cr-label">Ingredients</label>
                  <textarea
                    className="cr-textarea"
                    rows={4}
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    required
                  />
                </div>

                <div className="cr-field full">
                  <label className="cr-label">Instructions</label>
                  <textarea
                    className="cr-textarea"
                    rows={5}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    required
                  />
                </div>

                <div className="cr-field full">
                  <label className="cr-label">Recipe Image</label>
                  <input
                    className="cr-input cr-input-url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleImproveWithAI}
                className="cr-btn-primary"
                style={{ marginTop: "10px", background: "#4CAF50" }}
              >
                ✨ Improve with AI
              </button>

              {loadingAI && (
                <p style={{ marginTop: "8px", opacity: 0.7 }}>AI is improving your recipe…</p>
              )}

              {aiOutput && (
                <div
                  style={{
                    background: "#fafafa",
                    border: "1px solid #ddd",
                    padding: "12px",
                    marginTop: "10px",
                    borderRadius: "8px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <h3>✨ AI Improved Recipe</h3>

                  <strong>Title:</strong> {aiOutput.title || "(unchanged)"} <br /><br />

                  <strong>Ingredients:</strong>
                  <ul>
                    {aiOutput.ingredients?.map((i, idx) => (
                      <li key={idx}>{i}</li>
                    ))}
                  </ul>

                  <strong>Instructions:</strong>
                  <ol>
                    {aiOutput.instructions?.map((i, idx) => (
                      <li key={idx}>{i}</li>
                    ))}
                  </ol>

                  <button
                    type="button"
                    onClick={applyAIToForm}
                    className="cr-btn-secondary"
                    style={{ marginTop: "10px" }}
                  >
                    Apply to Form
                  </button>
                </div>
              )}

              <div className="cr-modal-actions">
                <button type="button" className="cr-btn-secondary" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button type="submit" className="cr-btn-primary">
                  Create Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


{showCollection && (
  <div className="cr-modal-backdrop" onClick={() => setShowCollection(false)}>
    <div
      className="cr-modal cr-modal-collection"
      onClick={(e) => e.stopPropagation()}
    >
      <header className="cr-modal-header">
        <div>
          <h2 className="cr-modal-title">My Collection</h2>
          <p className="cr-modal-subtitle">All of your saved culinary creations.</p>
        </div>
        <button className="cr-modal-close" onClick={() => setShowCollection(false)}>
          ×
        </button>
      </header>

      <div className="cr-collection-list">
        {recipes.length === 0 ? (
          <p className="cr-empty-message">You haven't created any recipes yet.</p>
        ) : (
          recipes.map((r) => (
            <div key={r.id} className="cr-collection-item">
              <img
                src={r.imageUrl || heroImg}
                alt={r.name}
                className="cr-collection-thumb"
              />

              <div className="cr-collection-info">
                <h3 className="cr-collection-name">{r.name}</h3>
                {r.cuisine && <p className="cr-collection-cuisine">{r.cuisine}</p>}
                {r.prepTime && <p className="cr-collection-prep">{r.prepTime} min</p>}
              </div>

              <div className="cr-collection-actions">
                <button
                  className="cr-view-btn"
                  onClick={() => {
                    setSelectedRecipe(r);
                    setShowRecipe(true);
                  }}
                >
                  View
                </button>

                <button className="cr-delete-btn" onClick={() => deleteRecipe(r.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
)}


      {showSpotifyPrompt && (
        <div className="cr-modal-backdrop" onClick={() => setShowSpotifyPrompt(false)}>
          <div className="cr-modal cr-modal-small" onClick={(e) => e.stopPropagation()}>
            {/* original content */}
          </div>
        </div>
      )}

      {showRecipe && selectedRecipe && (
        <div className="cr-modal-backdrop" onClick={() => setShowRecipe(false)}>
          <div className="cr-modal" onClick={(e) => e.stopPropagation()}>
            {/* original content */}
          </div>
        </div>
      )}
    </main>
  );
}
