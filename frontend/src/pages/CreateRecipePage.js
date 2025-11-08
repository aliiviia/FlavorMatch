import { useState } from "react";

export default function CreateRecipePage() {
  const [title, setTitle] = useState(""); 
  const [description, setDescription] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newRecipe = {
      title, 
      description,
      cuisine,
      ingredients: ingredients.split(",").map((i) => i.trim()),
      instructions,
      imageUrl,
    };

    console.log("Creating new recipe:", newRecipe);

    // 🔜 Later this will connect to your backend endpoint
    // const res = await fetch("http://localhost:5001/api/userRecipes", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(newRecipe),
    // });
    //
    // if (res.ok) alert("Recipe created successfully!");
    // else alert("Error creating recipe");
  };
  
  return (
    <section className="py-20 text-center bg-white min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        Create a Recipe
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto text-left bg-gray-50 p-8 rounded-xl shadow-md space-y-6"
      >
        {/* Title */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Recipe Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Homemade Pizza"
            required
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief summary of the recipe..."
            rows="2"
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Cuisine */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Cuisine
          </label>
          <input
            type="text"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            placeholder="e.g. Italian"
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Ingredients */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Ingredients (comma-separated)
          </label>
          <textarea
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Flour, Tomato Sauce, Cheese..."
            rows="4"
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Instructions */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Instructions
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Step-by-step cooking instructions..."
            rows="4"
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Image URL (optional)
          </label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/myrecipe.jpg"
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition"
          >
            Submit Recipe
          </button>
        </div>
      </form>
    </section>
  );
}
