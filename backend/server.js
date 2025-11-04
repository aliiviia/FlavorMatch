import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("FlavorMatch backend is running!");
});

//Testing endpoint
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from FlavorMatch backend!" });
});

app.get("/api/pair/:cuisine", async (req, res) => {
  const { cuisine } = req.params;

  
  const cuisineToGenre = {
  italian: "classical",
  mexican: "latin",
  japanese: "j-pop",
  indian: "indian",
  american: "country",
  french: "jazz",
  chinese: "chill",
  thai: "party",
  korean: "k-pop",
  greek: "world-music",
  brazilian: "samba",
  spanish: "spanish",
  mediterranean: "romance",
  caribbean: "reggae",
  vietnamese: "study",
  german: "german",
  british: "rock",
  turkish: "turkish",
  moroccan: "world-music",
  lebanese: "soul",
  ethiopian: "afrobeat",
  nigerian: "afrobeat",
  filipino: "philippines-opm",
  indonesian: "world-music",
  hawaiian: "summer",
  russian: "pop",
  canadian: "folk",
  irish: "songwriter",
  cuban: "salsa",
  argentinian: "tango",
  brazil: "bossanova",
  australian: "indie",
  swedish: "swedish",
  middleeastern: "world-music",
  african: "afrobeat"
};

  const genre = cuisineToGenre[cuisine.toLowerCase()] || "pop";

  try {
    // Calling the spotify Recommendations API
    const response = await fetch(`https://api.spotify.com/v1/recommendations?seed_genres=${genre}`, {
      headers: {
        Authorization: `Bearer ${process.env.SPOTIFY_ACCESS_TOKEN}` // When OAuth is implemented, replace with a valid token
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
