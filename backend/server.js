import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import axios from "axios";

import cuisineGenreMap from "./cuisineGenreMap.js";
import { MOCK_RECIPES } from "./mockRecipes.js";
import chatIngredientsRouter from "./chat-ingredients.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", chatIngredientsRouter);

app.get("/", (req, res) => res.send("FlavorMatch backend is running!"));
app.get("/api/hello", (req, res) =>
  res.json({ message: "Hello from FlavorMatch backend!" })
);

/* ------------------------------------------------------
   SPOONACULAR FALLBACK LOGIC
------------------------------------------------------ */
let spoonacularEnabled = true;
let lastFailureTime = null;
const SPOON_FAIL_TIMEOUT = 5 * 60 * 1000;

function disableSpoonacular() {
  spoonacularEnabled = false;
  lastFailureTime = Date.now();
  console.warn("🚫 Spoonacular temporarily disabled — using mock data only.");
}

function reenableSpoonacularIfTime() {
  if (!spoonacularEnabled && Date.now() - lastFailureTime > SPOON_FAIL_TIMEOUT) {
    spoonacularEnabled = true;
    console.log("🔁 Retrying Spoonacular after cooldown.");
  }
}

/* ------------------------------------------------------
   SPOTIFY — USER AUTH (LOGIN)
------------------------------------------------------ */
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

/* ------------------------------------------------------
   SPOTIFY — CALLBACK (TOKEN EXCHANGE)
------------------------------------------------------ */
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
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const access_token = tokenResponse.data.access_token;

    // Redirect user back to frontend with their token
    res.redirect(`${process.env.FRONTEND_URL}/?access_token=${access_token}`);

  } catch (err) {
    console.error("Error exchanging code:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to authenticate with Spotify" });
  }
});

/* ------------------------------------------------------
   SPOTIFY — FETCH USER PROFILE
------------------------------------------------------ */
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
    console.error("Error fetching profile:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

/* ------------------------------------------------------
   SPOTIFY — RECOMMEND SONGS
------------------------------------------------------ */
app.post("/api/recommendations", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { cuisine } = req.body;

    if (!token) return res.status(401).json({ error: "Missing token" });

    const keyword = cuisineGenreMap[cuisine] || cuisine;

    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(keyword)}&type=track&limit=20`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await searchRes.json();
    res.json({ tracks: data.tracks?.items || [] });

  } catch (err) {
    console.error("Error in recommendations:", err);
    res.status(500).json({ error: "Failed" });
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
   SPOTIFY — ADD TRACKS
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
   RECIPE ENDPOINTS (FULL + MOCK FALLBACK)
------------------------------------------------------ */

// HELPER: Try to get cuisine from title if Spoonacular fails
function getCuisineFromTitle(title) {
  const t = title.toLowerCase();
  if (t.includes("mexican")) return "mexican";
  if (t.includes("italian")) return "italian";
  if (t.includes("indian")) return "indian";
  if (t.includes("japanese")) return "japanese";
  if (t.includes("thai")) return "thai";
  return null;
}

/* ---------- GET RANDOM OR SEARCH RECIPES ---------- */
app.get("/api/recipes", async (req, res) => {
  const query = req.query.query?.toLowerCase();
  const spoonacularKey = process.env.SPOONACULAR_KEY;

  reenableSpoonacularIfTime();

  // PAGE LOAD — NO SEARCH
  if (!query) {
    if (!spoonacularEnabled) {
      return res.json(MOCK_RECIPES);
    }

    try {
      const apiRes = await fetch(
        `https://api.spoonacular.com/recipes/random?number=10&apiKey=${spoonacularKey}`
      );

      if (!apiRes.ok) throw new Error("Random fetch failed");

      const data = await apiRes.json();

      return res.json(
        data.recipes.map((r) => ({
          id: r.id,
          title: r.title,
          image: r.image,
          readyInMinutes: r.readyInMinutes,
          servings: r.servings,
        }))
      );

    } catch (err) {
      disableSpoonacular();
      return res.json(MOCK_RECIPES);
    }
  }

  // SEARCH MODE
  if (!spoonacularEnabled) {
    return res.json(
      MOCK_RECIPES.filter((r) => r.title.toLowerCase().includes(query))
    );
  }

  try {
    const apiRes = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=10&apiKey=${spoonacularKey}`
    );

    if (!apiRes.ok) throw new Error("Search failed");

    const data = await apiRes.json();

    if (data.results?.length > 0) {
      return res.json(data.results);
    }

    return res.json(
      MOCK_RECIPES.filter((r) => r.title.toLowerCase().includes(query))
    );

  } catch (err) {
    disableSpoonacular();
    return res.json(
      MOCK_RECIPES.filter((r) => r.title.toLowerCase().includes(query))
    );
  }
});

/* ---------- GET SINGLE RECIPE ---------- */
app.get("/api/recipeInfo", async (req, res) => {
  const { id } = req.query;
  const spoonacularKey = process.env.SPOONACULAR_KEY;

  reenableSpoonacularIfTime();

  if (!spoonacularEnabled) {
    const mock = MOCK_RECIPES.find((r) => String(r.id) === String(id));
    return res.json(mock);
  }

  try {
    const apiRes = await fetch(
      `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=false&apiKey=${spoonacularKey}`
    );

    if (!apiRes.ok) throw new Error("Info failed");

    const recipe = await apiRes.json();

    return res.json({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      summary: recipe.summary,
      extendedIngredients: recipe.extendedIngredients.map((i) => i.original),
      instructions: recipe.instructions,
      cuisine:
        recipe.cuisines?.[0]?.toLowerCase() ||
        getCuisineFromTitle(recipe.title) ||
        "american",
    });

  } catch (err) {
    disableSpoonacular();
    return res.json(
      MOCK_RECIPES.find((r) => String(r.id) === String(id))
    );
  }
});

/* ---------- AUTOCOMPLETE ---------- */
app.get("/api/autocomplete", async (req, res) => {
  const query = req.query.query?.toLowerCase();
  const spoonacularKey = process.env.SPOONACULAR_KEY;

  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    if (!spoonacularEnabled) {
      return res.json(
        MOCK_RECIPES.filter((r) =>
          r.title.toLowerCase().startsWith(query)
        ).slice(0, 8)
      );
    }

    const apiRes = await fetch(
      `https://api.spoonacular.com/recipes/autocomplete?number=8&query=${encodeURIComponent(
        query
      )}&apiKey=${spoonacularKey}`
    );

    if (!apiRes.ok) throw new Error("Autocomplete failed");

    const data = await apiRes.json();
    return res.json(data);

  } catch (err) {
    disableSpoonacular();
    return res.json(
      MOCK_RECIPES.filter((r) =>
        r.title.toLowerCase().startsWith(query)
      ).slice(0, 8)
    );
  }
});

/* ------------------------------------------------------
   START SERVER
------------------------------------------------------ */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
