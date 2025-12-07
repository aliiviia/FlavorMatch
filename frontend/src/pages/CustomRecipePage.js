// src/pages/CustomRecipePage.jsx
import { useState, useEffect } from "react";
import heroImg from "../images/create.png";
import box from "../images/123.png";
import fourImg from "../images/4.png";
import "../styles/Custom.css";

const LOCAL_KEY = "customRecipes";

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
      .then(res => res.json())
      .then(data => setRecipes(data))
      .catch(err => console.error("Failed to load recipes:", err));
  }, []);  

  // check if user is logged into Spotify (same logic your app uses)
  const isSpotifyConnected =
    typeof window !== "undefined" &&
    !!localStorage.getItem("spotify_token");
  // const isSpotifyConnected = true;

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

    // extra guard
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

    // reset form
    setName("");
    setCuisine("");
    setPrepTime("");
    setIngredients("");
    setInstructions("");
    setImageUrl("");

    setShowCreate(false);
    setShowCollection(true);
  };

  // const handleCreateSubmit = async (e) => {
  //   e.preventDefault();
  
  //   const formattedIngredients = ingredients
  //     .split("\n")
  //     .map(i => i.trim())
  //     .filter(Boolean);
  
  //   const payload = {
  //     title: name,
  //     description: `${cuisine} • ${prepTime}`, // optional
  //     cuisine,
  //     instructions,
  //     ingredients: formattedIngredients,
  //     image: imageUrl,
  //   };
  
  //   try {
  //     const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/customRecipe`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });
  
  //     const data = await res.json();
  
  //     if (data.success) {
  //       // Add new recipe to list
  //       setRecipes([data.recipe, ...recipes]);
  
  //       // Reset form
  //       setName("");
  //       setCuisine("");
  //       setPrepTime("");
  //       setIngredients("");
  //       setInstructions("");
  //       setImageUrl("");
  
  //       setShowCreate(false);
  //       setShowCollection(true);
  //     } else {
  //       alert("Failed to save recipe.");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     alert("Server error.");
  //   }
  // };
  

  const recipeCount = recipes.length;
  const categoryCount = new Set(
    recipes.map((r) => r.cuisine).filter((c) => c && c.trim().length > 0)
  ).size;

  return (
    <main className="custom-recipes-page">
      {/* ========== HERO ========== */}
      <section
        className="cr-hero"
        style={{
          backgroundImage: `url(${heroImg})`,
        }}
      >
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
              A curated collection of your personal culinary creations, crafted
              with passion and precision.
            </p>

            {!isSpotifyConnected && (
              <p className="cr-hero-warning">
                Connect your Spotify account to create and save custom recipes.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ========== MAIN ========== */}
      <section className="cr-main">
        <div className="cr-main-inner">
          <div className="cr-main-top-row">
            <p className="cr-section-label">FEATURED</p>
            <p className="cr-section-label cr-section-label-right">COLLECTION</p>
          </div>

          <div className="cr-grid">
            {/* LEFT COLUMN */}
            <div className="cr-left-column">
              {/* CREATE NEW RECIPE CARD */}
              <article
                className={`cr-feature-card ${
                  !isSpotifyConnected ? "cr-feature-card-disabled" : ""
                }`}
                onClick={handleCreateClick}
              >
                <div
                  className="cr-feature-image"
                  style={{
                    backgroundImage: `url(${fourImg})`,
                  }}
                >
                  {!isSpotifyConnected && (
                    <div className="cr-locked-banner">
                      <span>Connect Spotify to unlock</span>
                    </div>
                  )}

                  <div className="cr-feature-overlay" />
                  <div className="cr-feature-content">
                    <button
                      type="button"
                      className="cr-plus-circle"
                      aria-label="Create new recipe"
                    >
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
                Every great dish begins with inspiration. Whether it&apos;s a
                family tradition passed down through generations or a bold new
                fusion experiment, your recipes deserve to be documented and
                celebrated. Start creating today and build your personal
                cookbook.
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
                      {recipeCount}{" "}
                      {recipeCount === 1 ? "recipe" : "recipes"} saved
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
                  <p>
                    &quot;Cooking is like music - both are expressions of
                    creativity that bring people together.&quot;
                  </p>
                  <span className="cr-quote-source">
                    — FLAVORMATCH PHILOSOPHY
                  </span>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CREATE MODAL ========== */}
      {showCreate && (
        <div className="cr-modal-backdrop" onClick={() => setShowCreate(false)}>
          <div
            className="cr-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <header className="cr-modal-header">
              <div>
                <h2 className="cr-modal-title">Create New Recipe</h2>
                <p className="cr-modal-subtitle">
                  Fill in the details to save your masterpiece.
                </p>
              </div>
              <button
                className="cr-modal-close"
                type="button"
                onClick={() => setShowCreate(false)}
              >
                ×
              </button>
            </header>

            <form className="cr-modal-body" onSubmit={handleCreateSubmit}>
              <div className="cr-form-grid">
                <div className="cr-field full">
                  <label className="cr-label">Recipe Name</label>
                  <input
                    className="cr-input"
                    placeholder="e.g., Grandma's Secret Pasta"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="cr-field">
                  <label className="cr-label">Cuisine Type</label>
                  <input
                    className="cr-input"
                    placeholder="e.g., Italian"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                  />
                </div>

                <div className="cr-field">
                  <label className="cr-label">Prep Time</label>
                  <input
                    className="cr-input"
                    placeholder="e.g., 30 mins"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                  />
                </div>

                <div className="cr-field full">
                  <label className="cr-label">Ingredients</label>
                  <textarea
                    className="cr-textarea"
                    rows={4}
                    placeholder="List your ingredients…"
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
                    placeholder="Describe how to prepare…"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    required
                  />
                </div>

                <div className="cr-field full">
                  <label className="cr-label">Recipe Image</label>
                  <div className="cr-upload-zone">
                    <span className="cr-upload-icon">🖼️</span>
                    <p className="cr-upload-text">
                      Click to upload or drag and drop
                    </p>
                    <p className="cr-upload-sub">
                      PNG, JPG up to 10MB — or paste an image URL below
                    </p>
                  </div>
                  <input
                    className="cr-input cr-input-url"
                    placeholder="https://example.com/photo.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="cr-modal-actions">
                <button
                  type="button"
                  className="cr-btn-secondary"
                  onClick={() => setShowCreate(false)}
                >
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

      {/* ========== COLLECTION MODAL ========== */}
      {showCollection && (
        <div
          className="cr-modal-backdrop"
          onClick={() => setShowCollection(false)}
        >
          <div
            className="cr-modal cr-modal-collection"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <header className="cr-modal-header">
              <div>
                <h2 className="cr-modal-title">My Recipe Collection</h2>
                <p className="cr-modal-subtitle">Your saved creations.</p>
              </div>
              <button
                className="cr-modal-close"
                onClick={() => setShowCollection(false)}
              >
                ×
              </button>
            </header>

            <div className="cr-collection-body">
              {recipes.length === 0 ? (
                <div className="cr-empty-state">
                  <div className="cr-empty-icon">📘</div>
                  <h3 className="cr-empty-title">No Recipes Yet</h3>
                  <p className="cr-empty-text">
                    Start creating recipes to build your personal cookbook.
                  </p>
                  <button
                    className="cr-empty-button"
                    onClick={() => {
                      setShowCollection(false);
                      handleCreateClick();
                    }}
                  >
                    + Create Your First Recipe
                  </button>
                </div>
              ) : (
                <ul className="cr-collection-list">
                  {recipes.map((r) => (
                    <li 
                      key={r.id} 
                      className="cr-collection-item"
                      onClick={() => {
                        setSelectedRecipe(r);
                        setShowRecipe(true);
                      }}
                    >
                      <div className="cr-collection-thumb">
                        {r.imageUrl ? (
                          <img src={r.imageUrl} alt={r.name} />
                        ) : (
                          <span>{r.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="cr-collection-meta">
                        <h4>{r.name}</h4>
                        <p>
                          {r.cuisine || "Custom"} ·{" "}
                          {r.prepTime || "Prep time n/a"}
                        </p>
                      </div>
                      <button
                        className="cr-delete-button"
                        onClick={(e) => {
                          e.stopPropagation(); // prevents opening the modal
                          deleteRecipe(r.id);
                        }}
                      >
                        X
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== SPOTIFY PROMPT MODAL ========== */}
      {showSpotifyPrompt && (
        <div
          className="cr-modal-backdrop"
          onClick={() => setShowSpotifyPrompt(false)}
        >
          <div
            className="cr-modal cr-modal-small"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <header className="cr-modal-header">
              <div>
                <h2 className="cr-modal-title">Connect Spotify</h2>
                <p className="cr-modal-subtitle">
                  Sign in with Spotify to create recipes and sync them to your
                  collections.
                </p>
              </div>
              <button
                className="cr-modal-close"
                onClick={() => setShowSpotifyPrompt(false)}
              >
                ×
              </button>
            </header>

            <div className="cr-modal-actions">
              <button
                className="cr-btn-secondary"
                onClick={() => setShowSpotifyPrompt(false)}
              >
                Not now
              </button>
              <button
                className="cr-btn-primary"
                onClick={() => {
                  // 🔥 SAME BEHAVIOR AS NAVBAR BUTTON
                  window.location.href = "http://127.0.0.1:5001/login";
                }}
              >
                Connect Spotify
              </button>
            </div>
          </div>
        </div>
      )}

        {showRecipe && selectedRecipe && (
          <div 
            className="cr-modal-backdrop"
            onClick={() => setShowRecipe(false)}
          >
            <div 
              className="cr-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <header className="cr-modal-header">
                <h2 className="cr-modal-title">{selectedRecipe.name}</h2>
                <button 
                  className="cr-modal-close"
                  onClick={() => setShowRecipe(false)}
                >
                  ×
                </button>
              </header>

              <div className="cr-modal-body">
                {selectedRecipe.imageUrl && (
                  <img 
                    src={selectedRecipe.imageUrl}
                    alt={selectedRecipe.name}
                    className="cr-recipe-image"
                    style={{ width: "100%", borderRadius: "10px", marginBottom: "15px" }}
                  />
                )}

                <p><strong>Cuisine:</strong> {selectedRecipe.cuisine || "N/A"}</p>
                <p><strong>Prep Time:</strong> {selectedRecipe.prepTime || "N/A"}</p>

                <hr />

                <h3>Ingredients</h3>
                <p style={{ whiteSpace: "pre-wrap" }}>
                  {selectedRecipe.ingredients}
                </p>

                <h3>Instructions</h3>
                <p style={{ whiteSpace: "pre-wrap" }}>
                  {selectedRecipe.instructions}
                </p>
              </div>
            </div>
          </div>
        )}

    </main>
  );
}