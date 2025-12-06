import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import axios from "axios";
// import { pool } from "./db/index.js";

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

    if (!token) 
      return res.status(401).json({ error: "Missing token" });

    const keyword = cuisineGenreMap[cuisine] || cuisine;

    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(keyword)}&type=track&limit=20`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await searchRes.json();

    const cleanedTracks = (data.tracks?.items || [])
      .filter(t => t.uri)
      .map((t) => ({
        id: t.id,
        name: t.name,
        artists: t.artists,
        preview_url: t.preview_url,
        uri: t.uri,
      }));

    res.json({ tracks: cleanedTracks });

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
    // debugging playlist creation
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Playlist creation failed:", errorText);
      return res.status(response.status).json({ error: "Spotify error", details: errorText });
    }

    const playlist = await response.json();

    if (!playlist.id) {
      console.error("Spotify returned playlist WITHOUT ID:", playlist);
      return res.status(500).json({ error: "Missing playlist ID from Spotify" });
    }

    return res.json(playlist);

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
   RECIPES — MOCK FIRST, THEN SPOONACULAR
------------------------------------------------------ */
function applyDefaults(r) {
  return {
    id: r.id,
    title: r.title,
    image: r.image,
    summary: r.summary || "No summary available.",
    extendedIngredients: r.extendedIngredients || [],
    instructions: r.instructions || "No instructions available.",
    cuisine: r.cuisine || "american",
    readyInMinutes: r.readyInMinutes || 30,
    servings: r.servings || 2
  };
}

app.get("/api/recipes", async (req, res) => {
  const query = req.query.query?.toLowerCase();

  if (!query) {
    return res.json(MOCK_RECIPES.map(applyDefaults));
  }

  const filtered = MOCK_RECIPES.filter((r) =>
    r.title.toLowerCase().includes(query)
  );

  return res.json(filtered.map(applyDefaults));
});

app.get("/api/recipeInfo", async (req, res) => {
  const { id } = req.query;

  const mockRecipe = MOCK_RECIPES.find((r) => String(r.id) === String(id));

  if (mockRecipe) {
    return res.json(applyDefaults(mockRecipe));
  }

  if (!spoonacularEnabled) {
    return res.json(null);
  }

  try {
    const apiRes = await fetch(
      `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=false&apiKey=${process.env.SPOONACULAR_KEY}`
    );

    if (!apiRes.ok) throw new Error("Recipe not found");

    const recipe = await apiRes.json();

    return res.json(applyDefaults({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      summary: recipe.summary,
      extendedIngredients: recipe.extendedIngredients.map((i) => i.original),
      instructions: recipe.instructions,
      cuisine:
        recipe.cuisines?.[0]?.toLowerCase() ||
        "american",
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings
    }));

  } catch (err) {
    disableSpoonacular();
    return res.json(null);
  }
});

app.get("/api/autocomplete", (req, res) => {
  const query = req.query.query?.toLowerCase();

  if (!query) return res.json([]);

  const filtered = MOCK_RECIPES.filter((r) =>
    r.title.toLowerCase().startsWith(query)
  ).slice(0, 8);

  res.json(filtered.map(applyDefaults));
});


// app.post("/api/customRecipe", async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       instructions,
//       ingredients,
//       image,
//       cuisine
//     } = req.body;

//     const result = await pool.query(
//       `INSERT INTO recipes 
//         (recipe_name, description, instructions, ingredients, image, source, cuisine)
//        VALUES ($1, $2, $3, $4, $5, 'custom', $6)
//        RETURNING *`,
//       [
//         title,
//         description,
//         instructions,
//         JSON.stringify(ingredients),
//         image,
//         cuisine
//       ]
//     );

//     res.json({ success: true, recipe: result.rows[0] });
//   } catch (err) {
//     console.error("❌ Error saving recipe:", err);
//     res.status(500).json({ error: "Failed to save recipe" });
//   }
// });
// console.log("Custom Recipe route loaded");

/* ------------------------------------------------------
   CUSTOM RECIPES — LOAD FROM DATABASE
------------------------------------------------------ */
// app.get("/api/customRecipes", async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT * FROM recipes WHERE source = 'custom' ORDER BY recipe_id DESC"
//     );

//     return res.json(result.rows);
//   } catch (err) {
//     console.error("❌ Error loading recipes:", err);
//     return res.status(500).json({ error: "Failed to load recipes" });
//   }
// });


/* ------------------------------------------------------
   START SERVER
------------------------------------------------------ */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`🚀 Server running with robust mock/spoonacular fallback on port ${PORT}`)
);
