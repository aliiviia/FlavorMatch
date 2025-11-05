import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSearch = async () => {
    setMessage("Fetching recipes...");
    try {
      const res = await fetch(
        `http://localhost:5001/api/recipes?query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRecipes(data);
      setMessage("");
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setMessage("No recipes found.");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>FlavorMatch</h1>
        <p>Find recipes — and the songs that match their vibe 🎵</p>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a recipe..."
          style={{ padding: "8px", borderRadius: "6px", width: "250px" }}
        />
        <button
          onClick={handleSearch}
          style={{
            marginLeft: "10px",
            padding: "8px 12px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Search
        </button>

        {message && <p>{message}</p>}

        {/* Recipe results grid */}
        <div
          className="recipe-grid"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          {recipes.map((r) => (
            <div
              key={r.id}
              className="recipe-card"
              onClick={() => navigate(`/recipe/${r.id}`)}
              style={{
                cursor: "pointer",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "12px",
                padding: "10px",
                margin: "10px",
                width: "250px",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <img
                src={r.image}
                alt={r.title}
                style={{
                  width: "100%",
                  borderRadius: "8px",
                }}
              />
              <h3 style={{ color: "#fff", marginTop: "10px" }}>{r.title}</h3>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default Home;
