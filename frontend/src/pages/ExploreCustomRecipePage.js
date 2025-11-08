import { useState } from "react";

export default function ExploreRecipesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // 🔜 Later: call your backend to fetch filtered recipes
    // fetch(`/api/userRecipes?query=${encodeURIComponent(searchQuery)}`)
  };

  return (
    <main>
      <h1>
        View Custom Recipes
      </h1>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
      >
        <input
          type="text"
          placeholder="Search for a recipe..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="submit"
        >
          Search
        </button>
      </form>

      <div>
        <p>placeholder for results</p>
      </div>
    </main>
  );
}
