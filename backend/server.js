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

//  Spotify client credentials flow
let spotifyToken = null;
let tokenExpires = 0;

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

  console.log(" New Spotify token retrieved");
  return spotifyToken;
}

//  Spotify search, look for tracks by genre
async function getSpotifyTracks(genre, token) {
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      genre
    )}&type=track&limit=10`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const data = await res.json();
  console.log(
    `🎵 Spotify search for "${genre}" → ${data.tracks?.items?.length || 0} tracks`
  );
  return data.tracks?.items || [];
}

// 🎶 Main Song Endpoint
app.get("/api/songForRecipe", async (req, res) => {
  try {
    const recipe = req.query.recipe;
    if (!recipe)
      return res.status(400).json({ error: "Please provide a recipe name." });

    const cuisine = await getCuisine(recipe);
    const genre = cuisineGenreMap[cuisine] || "pop";
    console.log(` Recipe: ${recipe} | Cuisine: ${cuisine} | Genre: ${genre}`);

  // Replaced client credentials to use the users token 
  const userToken = req.headers.authorization?.split(" ")[1];
  if (!userToken) return res.status(401).json({ error: "Missing Spotify token" });

  const recRes = await fetch(
    `https://api.spotify.com/v1/recommendations?seed_genres=${genre}&limit=10`,
    {
      headers: { Authorization: `Bearer ${userToken}` }
    }
  );

  const data = await recRes.json();
  const tracks = data.tracks;


    if (!tracks.length) {
      console.log(` No tracks for "${genre}". Retrying with "chill".`);
      tracks = await getSpotifyTracks("chill", token);
    }

    if (!tracks.length)
      return res.status(404).json({ error: "No tracks found for this genre." });

    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];

    res.json({
      recipe,
      cuisine,
      genre,
      randomTrack: {
        name: randomTrack.name,
        artists: randomTrack.artists.map((a) => a.name),
        url: randomTrack.external_urls.spotify,
      },
      playlist: tracks.map((t) => ({
        name: t.name,
        artists: t.artists.map((a) => a.name),
        url: t.external_urls.spotify,
      })),
    });
  } catch (err) {
    console.error("Error in /api/songForRecipe:", err);
    res.status(500).json({ error: err.message });
  }
});


// Recipe Info Endpoint (Spoonacular + fallback)
app.get("/api/recipeInfo", async (req, res) => {
  const { id } = req.query;
  const spoonacularKey = process.env.SPOONACULAR_KEY;

  reenableSpoonacularIfTime();

  if (!spoonacularEnabled) {
    const mock = MOCK_RECIPES.find((r) => String(r.id) === String(id));
    return mock
      ? res.json(mock)
      : res.status(404).json({ error: "Recipe not found in fallback data" });
  }

  try {
    const apiRes = await fetch(
      `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=false&apiKey=${spoonacularKey}`
    );

    if (!apiRes.ok) throw new Error("Spoonacular failed");
    const recipe = await apiRes.json();

    res.json({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      summary: recipe.summary,
      extendedIngredients: recipe.extendedIngredients.map((i) => i.original),
      instructions: recipe.instructions,
    });
  } catch (err) {
    console.warn("Spoonacular failed in recipeInfo:", err.message);
    disableSpoonacular();
    const mock = MOCK_RECIPES.find((r) => String(r.id) === String(id));
    mock
      ? res.json(mock)
      : res.status(404).json({ error: "Recipe not found in fallback data" });
  }
});

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



// Playlist Endpoint temporary will be changing when OAuth is integrated(always public)
app.get("/api/playlist", async (req, res) => {
  const recipeName = req.query.recipe;
  try {
    const playlists = {
      italian: "https://open.spotify.com/playlist/37i9dQZF1DX6bBjHfdRnza",
      mexican: "https://open.spotify.com/playlist/37i9dQZF1DWYzpSJHStHHx",
      japanese: "https://open.spotify.com/playlist/37i9dQZF1DX4jP4eebSWR9",
      indian: "https://open.spotify.com/playlist/37i9dQZF1DX7R1MnT8pC9x",
      american: "https://open.spotify.com/playlist/37i9dQZF1DWXLeA8Omikj7",
      french: "https://open.spotify.com/playlist/37i9dQZF1DWZLxB4E8pGQK",
    };

    const cuisine =
      Object.keys(playlists).find((key) =>
        recipeName.toLowerCase().includes(key)
      ) || "american";

    res.json({ playlistUrl: playlists[cuisine] });
  } catch (err) {
    console.error("Error creating playlist:", err);
    res.status(500).json({ error: "Failed to create playlist" });
  }
});

// ---------------------------------------------------
// SPOTIFY OAUTH LOGIN FLOW (USER AUTHENTICATION)
// ---------------------------------------------------

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
  res.redirect(`http://127.0.0.1:3000/?token=${access_token}`); 
  } catch (err) {
    console.error("Error exchanging code:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to authenticate with Spotify" });
  }
});


// Step 3 — Get the user’s Spotify profile using the access token
app.get("/me", async (req, res) => {
  const token = req.query.token;

  try {
    const userResponse = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` }
    });

    res.json(userResponse.data);
  } catch (err) {
    console.error("Error fetching user profile:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch Spotify user profile" });
  }
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


