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

let spotifyToken = null;
let tokenExpires = 0;
/**
 * Obtain an access token from Spotify using our app’s client credentials (Client ID and Secret).
 * This token allows the backend to call Spotify’s APIs securely.
 */
async function getSpotifyToken() {
  if (spotifyToken && Date.now() < tokenExpires) return spotifyToken;

  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${client_id}:${client_secret}`).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  spotifyToken = data.access_token;
  tokenExpires = Date.now() + data.expires_in * 1000;
  return spotifyToken;
}




// ---- SERVER ----
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
