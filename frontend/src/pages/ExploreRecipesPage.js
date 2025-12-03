import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_RECIPES } from "../mockRecipes";
const API_URL = import.meta.env.VITE_BACKEND_URL;

export default function ExploreRecipesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  /* ---------------------------------------------------------
      LOAD DEFAULT RECIPES ON PAGE LOAD
  --------------------------------------------------------- */
  useEffect(() => {
    const loadInitialRecipes = async () => {
      try {
        const res = await fetch(`${API_URL}/api/recipes`);
        if (!res.ok) throw new Error("Backend fetch failed");

        const data = await res.json();

        setRecipes(
          data.map((r) => ({
            id: r.id,
            title: r.title,
            image: r.image,
            readyInMinutes: r.readyInMinutes,
            servings: r.servings,
          }))
        );
      } catch (err) {
        console.warn("⚠️ Using mock recipes fallback:", err);
        setRecipes(MOCK_RECIPES);
      }
    };

    loadInitialRecipes();
  }, []);

  /* ---------------------------------------------------------
      MAIN SEARCH
  --------------------------------------------------------- */
  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    try {
      setLoading(true);
      setError("");
      setHasSearched(true);

      const res = await fetch(
        `${API_URL}/api/recipes?query=${encodeURIComponent(query)}`
      );

      if (!res.ok) throw new Error("Failed to fetch recipes");

      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setRecipes(
          data.map((r) => ({
            id: r.id,
            title: r.title,
            image: r.image,
            readyInMinutes: r.readyInMinutes,
            servings: r.servings,
          }))
        );
      } else {
        setRecipes([]);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong searching recipes.");
      setRecipes(MOCK_RECIPES);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------
      AUTOCOMPLETE
  --------------------------------------------------------- */
  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/api/autocomplete?query=${encodeURIComponent(
          value
        )}`
      );

      if (!res.ok) throw new Error("Autocomplete failed");

      const data = await res.json();

      const filtered = data.filter((r) =>
        r.title.toLowerCase().startsWith(value.toLowerCase())
      );

      setSuggestions(filtered);
      setShowSuggestions(true);
    } catch (err) {
      console.warn("⚠️ Autocomplete using mock fallback");

      const fallback = MOCK_RECIPES.filter((r) =>
        r.title.toLowerCase().startsWith(value.toLowerCase())
      );

      setSuggestions(fallback);
      setShowSuggestions(true);
    }
  };

  return (
    <main className="explore-recipes-page">
      <div className="explore-container">

        {/* HEADER */}
        <header className="explore-header">
          <p className="custom-eyebrow">Discover</p>
          <h1 className="custom-title">Explore Recipes</h1>
          <p className="custom-subtitle">
            Search any dish by name, cuisine, or ingredients — and explore curated recipe music pairings.
          </p>
        </header>

        <form className="custom-search" onSubmit={handleSearch} style={{ position: "relative" }}>
          <input
            type="text"
            className="custom-search-input"
            placeholder="Search for a recipe..."
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          />

          <button type="submit" className="custom-search-button">
            🔍 Search
          </button>

          {/* AUTOCOMPLETE DROPDOWN */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="autocomplete-list">
              {suggestions.map((recipe, index) => (
                <li
                  key={recipe.id || index}
                  className="autocomplete-item"
                  onMouseDown={() => {
                    setSearchQuery(recipe.title);
                    setShowSuggestions(false);
                    navigate(`/recipe/${recipe.id}`);
                  }}
                >
                  {recipe.title}
                </li>
              ))}
            </ul>
          )}
        </form>

        {/* LOADING */}
        {loading && (
          <div className="loading-state">
            <p>Loading delicious recipes...</p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="loading-state">
            <p>{error}</p>
          </div>
        )}

        {/* NO RESULTS */}
        {!loading && hasSearched && recipes.length === 0 && !error && (
          <div className="loading-state">
            <p>No recipes found. Try another search.</p>
          </div>
        )}

        {/* RECIPES GRID */}
        {!loading && recipes.length > 0 && (
          <div className="recipes-grid">
            {recipes.map((recipe) => (
              <article
                key={recipe.id}
                className="recipe-card"
                onClick={() => navigate(`/recipe/${recipe.id}`)}
              >
                <div className="recipe-image-wrapper">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="recipe-image"
                  />
                  <div className="recipe-overlay" />
                </div>

                <div className="recipe-content">
                  <h3 className="recipe-title">{recipe.title}</h3>
                  <div className="recipe-meta">
                    {recipe.readyInMinutes && (
                      <span className="recipe-time">
                        ⏱ {recipe.readyInMinutes} min
                      </span>
                    )}
                    {recipe.servings && (
                      <span className="recipe-servings">
                        👥 {recipe.servings} servings
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
