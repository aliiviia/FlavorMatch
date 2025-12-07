import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Custom.css";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function CreateRecipePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const navigate = useNavigate();

  // 🟢 Check Spotify auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [aiOutput, setAiOutput] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("spotify_token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert("You must log in with Spotify to create a recipe.");
      return;
    }

    alert("Recipe created!");
  };

  async function handleImproveWithAI() {
    if (!ingredients.trim() && !instructions.trim()) {
      alert("Please enter ingredients or instructions first!");
      return;
    }

    setLoadingAI(true);
    setAiOutput("");

    try {
      const res = await fetch(`${API_URL}/api/ai/format-recipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          ingredients,
          steps: instructions,
        }),
      });

      const data = await res.json();
      setAiOutput(data.formattedRecipe);
    } catch (err) {
      console.error("AI error:", err);
      alert("AI could not process your recipe.");
    }

    setLoadingAI(false);
  }

  function applyAIToForm() {
    if (!aiOutput) return;

    const ingMatch = aiOutput.split("Ingredients")[1]?.split("Steps")[0];
    const stepMatch = aiOutput.split("Steps")[1];

    if (ingMatch) setIngredients(ingMatch.trim());
    if (stepMatch) setInstructions(stepMatch.trim());
  }

  /* ------------------- AUTH GATE -------------------- */

  if (!isAuthenticated) {
    return (
      <main className="create-page">
        <div className="create-inner" style={{ textAlign: "center", paddingTop: "60px" }}>
          <h1 className="create-title">Sign In Required</h1>
          <p className="create-subtitle">
            You must log in with Spotify to create a recipe.
          </p>

          <button
            className="create-submit"
            style={{ marginTop: "30px" }}
            onClick={() => {
              window.location.href = `${API_URL}/login`;
            }}
          >
            Sign in with Spotify
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="create-page">
      <div className="create-inner">

        {/* Header */}
        <header className="create-header">
          <div className="create-icon">👨🏽‍🍳</div>
          <h1 className="create-title">
            Create <span className="title-green">Your Recipe</span>
          </h1>
          <p className="create-subtitle">
            Share your culinary masterpiece with FlavorMatch.
          </p>
        </header>

        {/* Card */}
        <section className="create-card">
          <h2 className="create-card-title">Recipe Details</h2>
          <p className="create-card-subtitle">Fill in the information below</p>

          <form onSubmit={handleSubmit} className="create-form">

            <label className="create-label">Recipe Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Spicy Thai Basil Chicken"
              required
              className="create-input"
            />

            <label className="create-label">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief summary..."
              required
              className="create-textarea"
            />

            <label className="create-label">Cuisine (optional)</label>
            <input
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              placeholder="e.g. Italian"
              className="create-input"
            />

            <label className="create-label">Ingredients *</label>
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              rows={5}
              placeholder="List ingredients..."
              required
              className="create-textarea"
            />

            <label className="create-label">Instructions *</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={7}
              placeholder="Step-by-step instructions..."
              required
              className="create-textarea"
            />

            <label className="create-label">Image URL (optional)</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="create-input"
            />
            <button
              type="button"
              onClick={handleImproveWithAI}
              className="create-submit"
              style={{
                backgroundColor: "#4CAF50",
                marginTop: "15px",
                marginBottom: "10px"
              }}
            >
              ✨ Improve with AI
            </button>

            {/* ⭐ AI LOADING */}
            {loadingAI && (
              <p style={{ marginTop: "10px", opacity: 0.8 }}>
                AI is formatting your recipe...
              </p>
            )}

            {/* ⭐ AI OUTPUT PREVIEW */}
            {aiOutput && (
              <div
                style={{
                  background: "#f9f9f9",
                  borderRadius: "10px",
                  padding: "15px",
                  marginTop: "10px",
                  whiteSpace: "pre-wrap",
                  border: "1px solid #ddd"
                }}
              >
                <h3 style={{ marginTop: "0" }}>✨ AI Improved Version</h3>
                {aiOutput}

                <button
                  type="button"
                  onClick={applyAIToForm}
                  className="create-submit"
                  style={{
                    marginTop: "15px",
                    background: "#333",
                    padding: "10px"
                  }}
                >
                  Apply to Form
                </button>
              </div>
            )}

            <button type="submit" className="create-submit">
              Submit Recipe
            </button>

          </form>
        </section>
      </div>
    </main>
  );
}
