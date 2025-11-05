import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";        // for API calls
import cuisineGenreMap from "./cuisineGenreMap.js"; // we’ll create this small file

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("FlavorMatch backend is running!");
});

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from FlavorMatch backend!" });
});

/**
 * getCuisine(recipeName)
 * --------------------------------------------
 * Given a recipe name (e.g. "carne asada"),
 * this function uses the Spoonacular API to determine the recipe's cuisine type.
 **/

async function getCuisine(recipeName) {
  const spoonacularKey = process.env.SPOONACULAR_KEY;

  // first fetch the recipe ID
  const searchRes = await fetch(
    `https://api.spoonacular.com/recipes/complexSearch?query=${recipeName}&apiKey=${spoonacularKey}`
  );
  const searchData = await searchRes.json();

  // throw error if a recipe is not found
  if (!searchData.results?.length) throw new Error("No recipes found.");
  
  const recipeId = searchData.results[0].id;
  // get recipe information using api
  const infoRes = await fetch(
    `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${spoonacularKey}`
  );
  const infoData = await infoRes.json();
  // default fallback cuisine is amercan if none found
  return infoData.cuisines?.[0]?.toLowerCase() || "american";
}


// ---- SERVER ----
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
