import { useNavigate } from "react-router-dom";

function RecipeCard({ id, title, image, time, difficulty, tags = [] }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/recipe/${id}`);
  };

  return (
    <div className="recipe-card" onClick={handleClick}>
      {/* Top image + heart */}
      <div className="recipe-card-image-wrapper">
        <img src={image} alt={title} className="recipe-card-img" />
        <button
          className="recipe-card-heart"
          onClick={(e) => {
            e.stopPropagation();
            // hook up favorite later
          }}
        >
          ♡
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
