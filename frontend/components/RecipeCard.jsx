import { useNavigate } from "react-router-dom";

function RecipeCard({ id, title, image }) {
  const navigate = useNavigate();

  return (
    <div
      className="recipe-card"
      onClick={() => navigate(`/recipe/${id}`)} // navigate to details page
      style={{
        cursor: "pointer",
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: "12px",
        padding: "12px",
        margin: "12px",
        width: "240px",
        textAlign: "center",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.boxShadow = "0 0 10px rgba(29,185,84,0.6)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <img
        src={image}
        alt={title}
        style={{
          width: "100%",
          borderRadius: "10px",
          marginBottom: "10px",
          objectFit: "cover",
        }}
      />

      <h3
        style={{
          color: "#fff",
          fontSize: "1rem",
          marginTop: "8px",
          lineHeight: "1.4",
        }}
      >
        {title.length > 40 ? `${title.slice(0, 40)}...` : title}
      </h3>
    </div>
  );
}

export default RecipeCard;
