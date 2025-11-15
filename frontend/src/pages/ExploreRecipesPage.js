// src/pages/ExploreRecipesPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Sample recipes data - replace with API call
const sampleRecipes = [
  {
    id: 1,
    title: "Creamy Tuscan Chicken",
    image: "https://images.pexels.com/photos/4106483/pexels-photo-4106483.jpeg",
    readyInMinutes: 30,
    servings: 4
  },
  {
    id: 2,
    title: "Spicy Thai Basil Noodles",
    image: "https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg",
    readyInMinutes: 25,
    servings: 2
  },
  {
    id: 3,
    title: "Classic Margherita Pizza",
    image: "https://images.pexels.com/photos/4109990/pexels-photo-4109990.jpeg",
    readyInMinutes: 45,
    servings: 4
  },
  {
    id: 4,
    title: "Mediterranean Quinoa Bowl",
    image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
    readyInMinutes: 20,
    servings: 2
  },
  {
    id: 5,
    title: "Grilled Salmon Teriyaki",
    image: "https://images.pexels.com/photos/3843224/pexels-photo-3843224.jpeg",
    readyInMinutes: 25,
    servings: 3
  },
  {
    id: 6,
    title: "Vegetarian Pad Thai",
    image: "https://images.pexels.com/photos/3026810/pexels-photo-3026810.jpeg",
    readyInMinutes: 30,
    servings: 2
  }
];

export default function ExploreRecipesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState(sampleRecipes);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      // Simulate API call - replace with actual API
      setTimeout(() => {
        setRecipes(sampleRecipes);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error(err);
      setLoading(false);
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
        <form className="explore-search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="explore-search-input"
              placeholder="Search for recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Recipe Grid */}
        {loading && (
          <div className="loading-state">
            <p>Loading delicious recipes...</p>
          </div>
        )}

        {!loading && (
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
                  <div className="recipe-overlay"></div>
                </div>
                
                <div className="recipe-content">
                  <h3 className="recipe-title">{recipe.title}</h3>
                  
                  <div className="recipe-meta">
                    <span className="recipe-time">
                      <span className="meta-icon">⏱</span>
                      {recipe.readyInMinutes} min
                    </span>
                    <span className="recipe-servings">
                      <span className="meta-icon">👥</span>
                      {recipe.servings} servings
                    </span>
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