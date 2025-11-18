import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_RECIPES } from "../mockRecipes";

export default function ExploreRecipesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState([]); // ← start empty
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();

  /* ---------------------------------------------------------
      LOAD DEFAULT RECIPES ON PAGE LOAD (BACKEND OR MOCK)
  --------------------------------------------------------- */
  useEffect(() => {
    const loadInitialRecipes = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5001/api/recipes");

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
        `http://127.0.0.1:5001/api/recipes?query=${encodeURIComponent(query)}`
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
        setRecipes([]); // no results
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong searching recipes.");
      setRecipes(MOCK_RECIPES); // fallback so page never looks empty
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
        `http://127.0.0.1:5001/api/autocomplete?query=${encodeURIComponent(
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
        {/* Header */}
        <header className="explore-header">
          <h1 className="explore-title">
            Explore <span className="title-green">Recipes</span>
          </h1>
          <p className="explore-subtitle">
            Find your next culinary adventure with perfectly paired music
          </p>
        </header>

        {/* Search */}
        <form
          className="search-input-wrapper"
          style={{ position: "relative" }}
          onSubmit={handleSearch}
        >
          <span className="search-icon">🔍</span>

          <input
            type="text"
            className="explore-search-input"
            placeholder="Search for recipes..."
            value={searchQuery}
            onChange={handleInputChange}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
          />

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="autocomplete-list">
              {suggestions.map((recipe, i) => (
                <li
                  key={recipe.id || i}
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

        {/* Loading */}
        {loading && (
          <div className="loading-state">
            <p>Loading delicious recipes...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="loading-state">
            <p>{error}</p>
          </div>
        )}

        {/* No Results */}
        {!loading && hasSearched && recipes.length === 0 && !error && (
          <div className="loading-state">
            <p>No recipes found. Try another search.</p>
          </div>
        )}

        {/* Recipes Grid */}
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
                        <span className="meta-icon">⏱</span>
                        {recipe.readyInMinutes} min
                      </span>
                    )}

                    {recipe.servings && (
                      <span className="recipe-servings">
                        <span className="meta-icon">👥</span>
                        {recipe.servings} servings
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
