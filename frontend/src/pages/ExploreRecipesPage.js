import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_RECIPES } from "../mockRecipes"; 

const sampleRecipes = [
  {
    id: 1,
    title: "Creamy Tuscan Chicken",
    image: "https://images.pexels.com/photos/4106483/pexels-photo-4106483.jpeg",
    readyInMinutes: 30,
    servings: 4,
  },
  {
    id: 2,
    title: "Spicy Thai Basil Noodles",
    image: "https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg",
    readyInMinutes: 25,
    servings: 2,
  },
  {
    id: 3,
    title: "Classic Margherita Pizza",
    image: "https://images.pexels.com/photos/4109990/pexels-photo-4109990.jpeg",
    readyInMinutes: 45,
    servings: 4,
  },
  {
    id: 4,
    title: "Mediterranean Quinoa Bowl",
    image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
    readyInMinutes: 20,
    servings: 2,
  },
  {
    id: 5,
    title: "Grilled Salmon Teriyaki",
    image: "https://images.pexels.com/photos/3843224/pexels-photo-3843224.jpeg",
    readyInMinutes: 25,
    servings: 3,
  },
  {
    id: 6,
    title: "Vegetarian Pad Thai",
    image: "https://images.pexels.com/photos/3026810/pexels-photo-3026810.jpeg",
    readyInMinutes: 30,
    servings: 2,
  },
];

export default function ExploreRecipesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState(sampleRecipes);
  const [mock, setMock] = useState(MOCK_RECIPES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    try {
      setLoading(true);
      setError("");
      setHasSearched(true);

      // 🔗 Match your backend style (similar to RecipeDetails)
      const res = await fetch(
        `http://localhost:5001/api/recipes?query=${encodeURIComponent(
          query
        )}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch recipes");
      }

      const data = await res.json();
      // Adjust shape depending on backend: here we assume { results: [...] }
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
        // If no results, set empty and show message
        setRecipes([]);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong searching recipes. Showing sample recipes.");
      // Fallback so the page doesn’t look dead
      setRecipes(sampleRecipes);
    } finally {
      setLoading(false);
    }
  };

  //spoonacular's integration example
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
        `http://localhost:5001/api/autocomplete?query=${encodeURIComponent(value)}`
      );
  
      if (!res.ok) throw new Error("Failed to fetch autocomplete");
  
      const data = await res.json();
      
      const filtered = data.filter((r) =>
        r.title.toLowerCase().startsWith(value.toLowerCase())
      );
  
      setSuggestions(filtered);
      setShowSuggestions(true);
    } catch (err) {
      console.error("⚠️ Autocomplete error:", err);
  
      // fallback: use local mock data if Spoonacular fails
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
        {/* Header Section */}
        <header className="explore-header">
          <h1 className="explore-title">
            Explore <span className="title-green">Recipes</span>
          </h1>
          <p className="explore-subtitle">
            Find your next culinary adventure with perfectly paired music
          </p>
        </header>

        {/* Search Bar */}
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

          {/* 🔽 Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="autocomplete-list">
              {suggestions.map((recipe, i) => (
                <li
                  key={recipe.id || i}
                  className="autocomplete-item"
                  onMouseDown={() => {
                    setSearchQuery(recipe.title);
                    setShowSuggestions(false);
                    setSuggestions([]);
                    navigate(`/recipe/${recipe.id}`);
                  }}
                >
                  {recipe.title}
                </li>
              ))}
            </ul>
          )}
        </form>


        {/* Loading state */}
        {loading && (
          <div className="loading-state">
            <p>Loading delicious recipes...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="loading-state">
            <p>{error}</p>
          </div>
        )}

        {/* No results message (after a search) */}
        {!loading && hasSearched && recipes.length === 0 && !error && (
          <div className="loading-state">
            <p>No recipes found. Try a different search term!</p>
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
