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
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const exists = favorites.some((f) => f.id === id);
    setIsFavorite(exists);
  }, [id]);

  /* ---------------------------------------------------
      Toggle favorite
  --------------------------------------------------- */
  const toggleFavorite = (e) => {
    e.stopPropagation();

    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const exists = favorites.some((f) => f.id === id);

    if (exists) {
      // Remove from favorites
      favorites = favorites.filter((f) => f.id !== id);
      setIsFavorite(false);
    } else {
      // Add to favorites
      favorites.push({
        id,
        title,
        image,
        time,
        difficulty,
        tags,
      });
      setIsFavorite(true);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
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
