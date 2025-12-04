import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/Recipes.css";

function RecipeCard({ id, title, image, time, difficulty, tags = [] }) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  /* ---------------------------------------------------
      Check if this recipe is already in favorites
  --------------------------------------------------- */
useEffect(() => {
  const user_id = localStorage.getItem("user_id");
  if (!user_id) return;

  async function checkFavorite() {
    const res = await fetch(`${API_URL}/favorites/${user_id}`);
    const data = await res.json();
    const exists = data.some((f) => f.recipe_id === id);
    setIsFavorite(exists);
  }

  checkFavorite();
}, [id]);


/* ---------------------------------------------------
      Toggle favorite IN DATABASE
--------------------------------------------------- */
const toggleFavorite = async (e) => {
  e.stopPropagation();

  const user_id = localStorage.getItem("user_id");
  if (!user_id) {
    alert("Please log in first");
    return;
  }

  if (isFavorite) {
    // REMOVE FAVORITE (DELETE)
    await fetch(`${API_URL}/favorites`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, recipe_id: id }),
    });
    setIsFavorite(false);
  } else {
    // ADD FAVORITE (POST)
    await fetch(`${API_URL}/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, recipe_id: id }),
    });
    setIsFavorite(true);
  }
};


  /* ---------------------------------------------------
      MAIN CARD (UI unchanged)
  --------------------------------------------------- */
  const handleClick = () => {
    navigate(`/recipe/${id}`);
  };

  return (
    <div className="recipe-card" onClick={handleClick}>
      {/* Top image + heart */}
      <div className="recipe-card-image-wrapper">
        <img src={image} alt={title} className="recipe-card-img" />

        <button className="recipe-card-heart" onClick={toggleFavorite}>
          {isFavorite ? "❤️" : "♡"}
        </button>
      </div>

      {/* Bottom content */}
      <div className="recipe-card-body">
        <div className="recipe-card-top">
          <span className="recipe-time">{time}</span>
          {difficulty && (
            <span className="recipe-difficulty">{difficulty}</span>
          )}
        </div>

        <h3 className="recipe-card-title">{title}</h3>

        {tags.length > 0 && (
          <div className="recipe-tags">
            {tags.map((tag) => (
              <span key={tag} className="recipe-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="recipe-card-footer">
          <span className="view-recipe">View Recipe</span>
          <div className="play-pill">▶</div>
        </div>
      </div>
    </div>
  );
}

export default RecipeCard;
