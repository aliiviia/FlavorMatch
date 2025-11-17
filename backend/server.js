import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import cuisineGenreMap from "./cuisineGenreMap.js";
import { MOCK_RECIPES } from "./mockRecipes.js";
import { pool } from "./db/index.js";
import axios from "axios";

dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("FlavorMatch backend is running!"));
app.get("/api/hello", (req, res) =>
  res.json({ message: "Hello from FlavorMatch backend!" })
);

//  Flag to disable Spoonacular temporarily after repeated failures
// If we use our API limited it wil just fall back to mock data 
let spoonacularEnabled = true;
let lastFailureTime = null;
const SPOON_FAIL_TIMEOUT = 5 * 60 * 1000; // 5 minutes cooldown

function disableSpoonacular() {
  spoonacularEnabled = false;
  lastFailureTime = Date.now();
  console.warn(
    "🚫 [FLAVORMATCH] Spoonacular temporarily disabled — using mock data only."
  );
}

function reenableSpoonacularIfTime() {
  if (!spoonacularEnabled && Date.now() - lastFailureTime > SPOON_FAIL_TIMEOUT) {
    spoonacularEnabled = true;
    console.log("🔁 [FLAVORMATCH] Retrying Spoonacular after cooldown.");
  }
}

// Get cuisine type (Spoonacular + fallback)
async function getCuisine(recipeName) {
  const spoonacularKey = process.env.SPOONACULAR_KEY;

  reenableSpoonacularIfTime();

  if (!spoonacularEnabled) {
    const match = MOCK_RECIPES.find((r) =>
      r.title.toLowerCase().includes(recipeName.toLowerCase())
    );
    return match?.cuisine?.toLowerCase() || "pop";
  }

  try {
    const searchRes = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?query=${recipeName}&apiKey=${spoonacularKey}`
    );
    if (!searchRes.ok) throw new Error("Spoonacular API error");
    const searchData = await searchRes.json();

    if (!searchData.results?.length) throw new Error("No results");

    const recipeId = searchData.results[0].id;
    const infoRes = await fetch(
      `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${spoonacularKey}`
    );
    const infoData = await infoRes.json();

    return infoData.cuisines?.[0]?.toLowerCase() || "american";
  } catch (err) {
    console.warn(" Spoonacular unavailable in getCuisine:", err.message);
    disableSpoonacular();
    const match = MOCK_RECIPES.find((r) =>
      r.title.toLowerCase().includes(recipeName.toLowerCase())
    );
    return match?.cuisine?.toLowerCase() || "pop";
  }
}

/* ------------------------------------------------------
   SPOTIFY — USER AUTH (OAUTH FLOW)
------------------------------------------------------ */
// Step 1 — Redirect user to Spotify Login Page
app.get("/login", (req, res) => {
  const authorizeUrl = "https://accounts.spotify.com/authorize";

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    scope: [
      "user-read-email",
      "user-read-private",
      "playlist-modify-public",
      "playlist-modify-private"
    ].join(" ")
  });

  res.redirect(`${authorizeUrl}?${params.toString()}`);
});


// Step 2 — Spotify redirects back with a code → exchange it for an access token
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );

    const access_token = tokenResponse.data.access_token;

    // Redirect back to frontend with the token
    res.redirect("http://127.0.0.1:3000/?access_token=" + access_token);
  } catch (err) {
    console.error("Error exchanging code:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to authenticate with Spotify" });
  }
});


// Step 3 — Get the user’s Spotify profile using the access token
app.get("/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const userResponse = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const user = userResponse.data;

    res.json({
      id: user.id,
      name: user.display_name,
      image: user.images?.[0]?.url || null
    });
  } catch (err) {
    console.error("Error fetching user profile:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch Spotify user profile" });
  }
});

/* ------------------------------------------------------
   SPOTIFY — RECOMMEND SONGS USING SEARCH INSTEAD OF GENRES
------------------------------------------------------ */
app.post("/api/recommendations", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { cuisine } = req.body;

    if (!token) return res.status(401).json({ error: "Missing Spotify token" });

    // Use your cuisineGenreMap for search keywords
    const keyword = cuisineGenreMap[cuisine] || cuisine;

    console.log("Searching Spotify with keyword:", keyword);

    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        keyword
      )}&type=track&limit=20`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await searchRes.json();

    res.json({ tracks: data.tracks?.items || [] });
  } catch (err) {
    console.error("Error in recommendations:", err);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});


/* ------------------------------------------------------
   SPOTIFY — CREATE PLAYLIST
------------------------------------------------------ */
app.post("/api/createPlaylist", async (req, res) => {
const token = req.headers.authorization?.split(" ")[1];
const { userId, recipeTitle } = req.body;

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: `FlavorMatch • ${recipeTitle}`,
          description: "A custom playlist generated by FlavorMatch",
          public: false
        })
      }
    );

    const playlist = await response.json();
    res.json(playlist);
  } catch (err) {
    console.error("Create playlist error:", err);
    res.status(500).json({ error: "Failed to create playlist" });
  }
});

/* ------------------------------------------------------
   SPOTIFY — ADD TRACKS TO PLAYLIST
------------------------------------------------------ */
app.post("/api/addTracks", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { playlistId, uris } = req.body;

  try {
    await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ uris })
      }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Add tracks error:", err);
    res.status(500).json({ error: "Failed to add tracks" });
  }
});

/* ------------------------------------------------------
   RECIPE INFO ENDPOINT
------------------------------------------------------ */
// Recipe Info Endpoint (Spoonacular + fallback)
//  Recipe Info Endpoint (Spoonacular + fallback) with cuisine detection
app.get("/api/recipeInfo", async (req, res) => {
  const { id } = req.query;
  const spoonacularKey = process.env.SPOONACULAR_KEY;

  reenableSpoonacularIfTime();

  if (!spoonacularEnabled) {
    const mock = MOCK_RECIPES.find((r) => String(r.id) === String(id));

    if (!mock) {
      return res.status(404).json({ error: "Recipe not found in fallback data" });
    }

    // Add cuisine from mock → matches your cuisineGenreMap
    return res.json({
      ...mock,
      cuisine: mock.cuisine?.toLowerCase() || "american",
    });
  }

  try {
    const apiRes = await fetch(
      `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=false&apiKey=${spoonacularKey}`
    );

    if (!apiRes.ok) throw new Error("Spoonacular failed");

    const recipe = await apiRes.json();

    // Detect cuisine from Spoonacular
    const cuisine =
      recipe.cuisines?.[0]?.toLowerCase() ||
      // fallback to keyword mapping (optional)
      getCuisineFromTitle(recipe.title) ||
      "american";

    res.json({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      summary: recipe.summary,
      extendedIngredients: recipe.extendedIngredients.map((i) => i.original),
      instructions: recipe.instructions,
      cuisine,
    });
  } catch (err) {
    console.warn("Spoonacular failed in recipeInfo:", err.message);
    disableSpoonacular();

    const mock = MOCK_RECIPES.find((r) => String(r.id) === String(id));

    if (!mock) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.json({
      ...mock,
      cuisine: mock.cuisine?.toLowerCase() || "american",
    });
  }
});

// Helper: fallback title-based cuisine detection
function getCuisineFromTitle(title) {
  const t = title.toLowerCase();
  if (t.includes("mexican")) return "mexican";
  if (t.includes("italian")) return "italian";
  if (t.includes("indian")) return "indian";
  if (t.includes("japanese") || t.includes("sushi") || t.includes("teriyaki"))
    return "japanese";
  if (t.includes("thai")) return "thai";
  return null;
}

//  Recipes List Endpoint if spoonacular API is not available fallback to mock data
app.get("/api/recipes", async (req, res) => {
  const query = req.query.query?.toLowerCase();
  const spoonacularKey = process.env.SPOONACULAR_KEY;

  reenableSpoonacularIfTime();
  console.log("🔍 Received query:", query);

  if (!spoonacularEnabled) {
    console.warn("🚫 Spoonacular temporarily disabled — using mock data.");
    const filtered = MOCK_RECIPES.filter((r) =>
      r.title.toLowerCase().includes(query)
    );
    return res.json(filtered.length ? filtered : MOCK_RECIPES.slice(0, 5));
  }

  try {
    const apiRes = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=5&apiKey=${spoonacularKey}`
    );

    if (!apiRes.ok)
      throw new Error(`Spoonacular failed (status ${apiRes.status})`);

    const data = await apiRes.json();

    const recipes = data.results.map((r) => ({
      id: r.id,
      title: r.title,
      image: r.image,
    }));

    res.json(recipes);
  } catch (err) {
    console.warn("⚠️ Spoonacular failed in /api/recipes:", err.message);
    disableSpoonacular();
    const filtered = MOCK_RECIPES.filter((r) =>
      r.title.toLowerCase().includes(query)
    );
    res.json(filtered.length ? filtered : MOCK_RECIPES.slice(0, 5));
  }
});

app.get("/api/autocomplete", async (req, res) => {
  const query = req.query.query?.toLowerCase();
  const spoonacularKey = process.env.SPOONACULAR_KEY;

  if (!query) {
    return res.status(400).json({ error: "Missing query parameter" });
  }

  try {
    // Skip Spoonacular entirely if it's disabled or key missing
    if (!spoonacularEnabled || !spoonacularKey) {
      console.warn("🚫 [Autocomplete] Spoonacular disabled — using mock data.");
      const filtered = MOCK_RECIPES.filter((r) =>
        r.title.toLowerCase().includes(query)
      );
      return res.json(
        filtered.slice(0, 8).map((r) => ({
          id: r.id,
          title: r.title,
        }))
      );
    }

    // Attempt Spoonacular call
    const apiRes = await fetch(
      `https://api.spoonacular.com/recipes/autocomplete?number=8&query=${encodeURIComponent(
        query
      )}&apiKey=${spoonacularKey}`
    );

    if (!apiRes.ok) {
      throw new Error(`Spoonacular autocomplete failed (${apiRes.status})`);
    }

    const data = await apiRes.json();
    res.json(data);
  } catch (err) {
    console.warn("⚠️ Error in /api/autocomplete:", err.message);
    disableSpoonacular?.(); // if you have this helper, it prevents repeated fails

    // Fallback to mock data
    const filtered = MOCK_RECIPES.filter((r) =>
      r.title.toLowerCase().includes(query)
    );
    res.json(
      filtered.slice(0, 8).map((r) => ({
        id: r.id,
        title: r.title,
      }))
    );
  }
});


// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


