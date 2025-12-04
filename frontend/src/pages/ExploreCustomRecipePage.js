import { useState } from "react";
import "../styles/Recipes.css";

export default function ExploreCustomRecipesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <main className="custom-page">
      <div className="custom-page-inner">

        {/* HEADER */}
        <header className="custom-header">
          <p className="custom-eyebrow">Discover</p>

          <h1 className="custom-title">Explore Custom Recipes</h1>

          <p className="custom-subtitle">
            Browse all user-created dishes. Search by name, cuisine, or
            ingredients — and rediscover your culinary creations.
          </p>
        </header>

        {/* SEARCH BAR */}
        <form className="custom-search" onSubmit={handleSearch}>
          <input
            type="text"
            className="custom-search-input"
            placeholder="Search for a recipe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button type="submit" className="custom-search-button">
            🔍 Search
          </button>
        </form>

        {/* RESULTS */}
        <section className="custom-results">
          <p className="custom-empty">No custom recipes found yet.</p>
        </section>
      </div>
    </main>
  );
}
