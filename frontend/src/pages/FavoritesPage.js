// src/pages/FavoritesPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconHeartFilled } from "@tabler/icons-react";
import "../styles/Recipes.css";

// Example rows shown when there are no real favorites yet
const placeholderPairings = [
  {
    id: "ph-1",
    title: "Carne Asada",
    cuisine: "Mexican",
    chef: "Chef Maria Rodriguez",
    addedAt: "5 days ago",
    time: "45 min",
    image: "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg",
  },
  {
    id: "ph-2",
    title: "Sushi Rolls",
    cuisine: "Japanese",
    chef: "Chef Takeshi Yamamoto",
    addedAt: "1 week ago",
    time: "30 min",
    image: "https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg",
  },
  {
    id: "ph-3",
    title: "Pad Thai",
    cuisine: "Thai",
    chef: "Chef Somchai Patel",
    addedAt: "2 weeks ago",
    time: "25 min",
    image: "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg",
  },
  {
    id: "ph-4",
    title: "Chicken Tikka Masala",
    cuisine: "Indian",
    chef: "Chef Priya Sharma",
    addedAt: "3 weeks ago",
    time: "50 min",
    image: "https://images.pexels.com/photos/1437268/pexels-photo-1437268.jpeg",
  },
  {
    id: "ph-5",
    title: "Greek Salad",
    cuisine: "Greek",
    chef: "Chef Dimitri Kostas",
    addedAt: "1 month ago",
    time: "15 min",
    image: "https://images.pexels.com/photos/1435907/pexels-photo-1435907.jpeg",
  },
  {
    id: "ph-6",
    title: "Spaghetti Carbonara",
    cuisine: "Italian",
    chef: "Chef Giovanni Rossi",
    addedAt: "1 month ago",
    time: "20 min",
    image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
  },
  {
    id: "ph-7",
    title: "Beef Tacos",
    cuisine: "Mexican",
    chef: "Chef Carlos Mendez",
    addedAt: "2 months ago",
    time: "35 min",
    image: "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg",
  },
  {
    id: "ph-8",
    title: "Ramen Bowl",
    cuisine: "Japanese",
    chef: "Chef Kenji Tanaka",
    addedAt: "2 months ago",
    time: "60 min",
    image: "https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg",
  },
];

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [pairings, setPairings] = useState([]);

  // Load real favorites from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favorites")) || [];
    setPairings(saved);
  }, []);

  // Use placeholders if there are no favorites yet
  const usePlaceholder = pairings.length === 0;
  const displayList = usePlaceholder ? placeholderPairings : pairings;

  const recipeCount =
    displayList.length === 1 ? "1 recipe" : `${displayList.length} recipes`;

  return (
    <main className="favorites-page">
      {/* TOP HEADER */}
      <section className="favorites-hero">
        <div className="favorites-hero-inner">
          <div className="favorites-cover">
            <IconHeartFilled
              className="favorites-cover-icon"
              size={90}
              color="#ffffff"   // solid white fill
            />
          </div>



          <div className="favorites-meta">
            <span className="favorites-label">PLAYLIST</span>
            <h1 className="favorites-title-hero">Liked Recipes</h1>
            <p className="favorites-meta-sub">FlavorMatch · {recipeCount}</p>
          </div>
        </div>
      </section>

      {/* TABLE OF RECIPES */}
      <section className="favorites-body">
        <div className="favorites-table">
          {/* Header row */}
          <div className="favorites-table-header">
            <div>#</div>
            <div>TITLE</div>
            <div>CHEF</div>
            <div>DATE ADDED</div>
            <div className="favorites-time-col">⏱</div>
          </div>

          {/* Data rows */}
          {displayList.map((item, index) => (
            <div
              key={item.id}
              className="favorites-row"
              onClick={() => {
                // Only navigate for real favorites, not placeholders
                if (!usePlaceholder) {
                  navigate(`/recipe/${item.id}`);
                }
              }}
              style={{ cursor: usePlaceholder ? "default" : "pointer" }}
            >
              {/* index */}
              <div className="favorites-col-index">{index + 1}</div>

              {/* image + title + cuisine */}
              <div className="favorites-col-title">
                <img
                  src={item.image}
                  alt={item.title}
                  className="favorites-row-img"
                />
                <div className="favorites-row-text">
                  <p className="favorites-row-title">{item.title}</p>
                  <p className="favorites-row-sub">
                    {item.cuisine || item.tags?.[0] || "Recipe"}
                  </p>
                </div>
              </div>

              {/* chef */}
              <div className="favorites-col-chef">
                {item.chef || "Unknown Chef"}
              </div>

              {/* date added */}
              <div className="favorites-col-added">
                {item.addedAt || "Recently"}
              </div>

              {/* time */}
              <div className="favorites-col-time">
                {item.time || item.duration || "—"}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
