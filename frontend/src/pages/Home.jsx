// src/pages/Home.jsx (or src/Home.jsx depending on your setup)
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const featuredPairings = [
  {
    id: 1,
    title: "Creamy Pasta",
    desc: "Smooth jazz for smooth pasta",
    image:
      "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
    badge: "🎵 Jazz",
    time: "25 min",
    tracks: "12 tracks",
  },
  {
    id: 2,
    title: "Spicy Bibimbap",
    desc: "Energetic K-Pop beats for bold flavors",
    image:
      "https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg",
    badge: "🎵 K-Pop",
    time: "35 min",
    tracks: "15 tracks",
  },
  {
    id: 3,
    title: "Chocolate Dessert",
    desc: "Classical elegance for refined desserts",
    image:
      "https://images.pexels.com/photos/4109990/pexels-photo-4109990.jpeg",
    badge: "🎵 Classical",
    time: "40 min",
    tracks: "8 tracks",
  },
];

const genres = [
  {
    title: "Jazz & Blues",
    subtitle: "Smooth cooking",
    icon: "🎷",
  },
  {
    title: "Rock & Pop",
    subtitle: "Energetic prep",
    icon: "🎸",
  },
  {
    title: "Acoustic",
    subtitle: "Mindful cooking",
    icon: "🎵",
  },
  {
    title: "World Music",
    subtitle: "Cultural fusion",
    icon: "🌍",
  },
];

export default function Home() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  // Handler for Connect Spotify button
  const handleSpotifyConnect = () => {
    // You can replace this with actual Spotify OAuth flow
    // For now, just log or navigate to a connect page
    console.log("Connecting to Spotify...");
    // Example: window.location.href = "your-spotify-auth-url";
    // Or navigate to a connect page: navigate('/connect-spotify');
  };

  // Handler for Subscribe button
  const handleSubscribe = () => {
    if (email) {
      console.log("Subscribing email:", email);
      // Add your subscription logic here
      alert(`Thank you for subscribing with ${email}!`);
      setEmail("");
    }
  };

  return (
    <>
      {/* HERO */}
      <section className="hero hero-with-image">
        <div className="hero-overlay" />
        <div className="hero-inner hero-inner-centered">
          <h1 className="hero-title">
            Cook to the <br />
            <span>Beat</span>
          </h1>

          <p className="hero-subtitle">
            Discover recipes perfectly paired with Spotify playlists
          </p>
          <p className="hero-subtext">
            Every dish has its rhythm. Find the perfect soundtrack for your
            cooking adventures.
          </p>
          <div className="hero-actions">
            <button
              className="primary-btn"
              type="button"
              onClick={() => {
                const element = document.getElementById("featured-pairings");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5v14l11-7z" fill="currentColor"/>
              </svg>
              Start Cooking
            </button>

            <button 
              className="secondary-btn"
              type="button"
              onClick={handleSpotifyConnect}
            >
              <svg className="spotify-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M15.5 9.5c-1.5-1-4.5-1.5-7.5-0.5M16 12c-1.5-1-4-1.5-6.5-0.5M14.5 14.5c-1-0.667-3-1-5.5 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Connect Spotify
            </button>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Three simple steps to culinary harmony</p>
        </div>
        <div className="steps-row">
          <div className="step-card">
            <div className="step-icon">🔎</div>
            <h3>1. Browse Recipes</h3>
            <p>
              Explore our curated collection of recipes with music pairings.
            </p>
          </div>
          <div className="step-card">
            <div className="step-icon">🎧</div>
            <h3>2. Connect Spotify</h3>
            <p>
              Link your Spotify account to access curated cooking playlists.
            </p>
          </div>
          <div className="step-card">
            <div className="step-icon">🎶</div>
            <h3>3. Cook &amp; Listen</h3>
            <p>
              Follow the recipe while enjoying the perfect soundtrack.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED PAIRINGS */}
      <section
        id="featured-pairings"
        className="section featured-pairings"
      >
        <div className="section-header">
          <h2>Featured Pairings</h2>
          <p>Perfect recipe and playlist combinations</p>
        </div>

        <div className="pairings-grid">
          {featuredPairings.map((item) => (
            <div
              key={item.id}
              className="pairing-card"
              onClick={() => navigate(`/recipe/${item.id}`)}
            >
              <div className="pairing-image-wrap">
                <img
                  src={item.image}
                  alt={item.title}
                  className="pairing-image"
                />
                <div className="pairing-badge">{item.badge}</div>
              </div>
              <div className="pairing-body">
                <h3>{item.title}</h3>
                <p className="pairing-desc">{item.desc}</p>
                <div className="pairing-meta">
                  <span>⏱ {item.time}</span>
                  <span>🎵 {item.tracks}</span>
                </div>
                <div className="pairing-footer">
                  <button 
                    className="cook-btn"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      navigate(`/recipe/${item.id}`);
                    }}
                  >
                    Cook Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="outline-dark-btn"
          onClick={() => navigate("/recipes")}
        >
          Explore All Recipes
        </button>
      </section>

      {/* COOKING GENRES */}
      <section className="section genres-section">
        <div className="genres-inner">
          <h2>Cooking Genres</h2>
          <p>Find your cooking rhythm</p>

          <div className="genres-grid">
            {genres.map((g) => (
              <div key={g.title} className="genre-card">
                <div className="genre-icon">{g.icon}</div>
                <h3>{g.title}</h3>
                <p>{g.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STAY IN TUNE */}
      <section className="section stay-in-tune">
        <div className="stay-inner">
          <h2>Stay in Tune</h2>
          <p>
            Get weekly recipe and playlist pairings delivered to your inbox.
          </p>
          <div className="stay-form">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubscribe();
                }
              }}
            />
            <button 
              className="subscribe-btn"
              onClick={handleSubscribe}
            >
              ✉ Subscribe
            </button>
          </div>
        </div>
      </section>
    </>
  );
}