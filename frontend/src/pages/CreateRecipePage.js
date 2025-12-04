import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

            <button type="submit" className="create-submit">
              Submit Recipe
            </button>

          </form>
        </section>
      </div>
    </main>
  );
}
