// src/pages/Home.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconChefHat, IconSparkles, IconMusic } from "@tabler/icons-react";

const featuredPairings = [
  {
    id: 1,
    title: "Creamy Tuscan Chicken",
    desc: "Rich, comforting flavors with smooth, romantic tunes.",
    image: "https://images.pexels.com/photos/4106483/pexels-photo-4106483.jpeg",
    badge: "Comfort",
    time: "30 min",
    tracks: "3 songs",
  },
  {
    id: 2,
    title: "Spicy Thai Basil Noodles",
    desc: "Bold spice with energetic, modern beats.",
    image: "https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg",
    badge: "Spice",
    time: "25 min",
    tracks: "3 songs",
  },
  {
    id: 3,
    title: "Classic Margherita Pizza",
    desc: "Laid-back Italian vibes for a cozy night in.",
    image: "https://images.pexels.com/photos/4109990/pexels-photo-4109990.jpeg",
    badge: "Classic",
    time: "45 min",
    tracks: "3 songs",
  },
];

export default function Home() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubscribe = () => {
    if (!email) return;
    alert(`Thank you for subscribing with ${email}!`);
    setEmail("");
  };

  return (
    <>
      {/* =============== HERO SECTION =============== */}
      <section className="hero">
        <div className="hero-inner hero-inner-centered">
          {/* Icons */}
          <div className="hero-icons">
            <div className="hero-icon-wrapper">
              <div className="hero-icon-glow">
                <IconChefHat color="#1db954" stroke={2} size={40} />
              </div>
            </div>

            <div className="hero-icon-wrapper">
              <div className="hero-icon-glow">
                <IconSparkles color="#1db954" stroke={2} size={40} />
              </div>
            </div>

            <div className="hero-icon-wrapper">
              <div className="hero-icon-glow">
                <IconMusic color="#1db954" stroke={2} size={40} />
              </div>
            </div>
          </div>

          {/* Hero Titles */}
          <h1 className="hero-title hero-title-large">
            Discover recipes that
            <br />
            <span className="hero-highlight">sound as good</span>
            <br />
            as they taste
          </h1>

          <p className="hero-subtext hero-subtext-large">
            Match your culinary adventures with the perfect soundtrack.
            <br />
            Explore recipes paired with curated Spotify playlists.
          </p>

          {/* Hero Buttons */}
          <div className="hero-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={() => navigate("/recipes")}
            >
              <div className="btn-icon">
                <IconChefHat color="#ffffff" stroke={2} size={20} />
              </div>
              Explore Recipes
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => console.log("Connect Spotify")}
            >
              <div className="spotify-icon">
                <IconMusic color="#1db954" stroke={2} size={20} />
              </div>
              Connect Spotify
            </button>
          </div>
        </div>
      </section>

      {/* =============== HOW IT WORKS SECTION =============== */}
      <section className="section benefits-section">
        <div className="benefits-inner">
          <div className="benefits-grid">
            <article className="benefit-card">
              <div className="benefit-icon-wrap">
                <div className="benefit-icon">
                  <IconChefHat color="#1db954" stroke={2} size={32} />
                </div>
              </div>
              <h3 className="benefit-title">Discover Recipes</h3>
              <p className="benefit-text">
                Browse thousands of delicious recipes from cuisines around the
                world.
              </p>
            </article>

            <article className="benefit-card">
              <div className="benefit-icon-wrap">
                <div className="benefit-icon">
                  <IconSparkles color="#1db954" stroke={2} size={32} />
                </div>
              </div>
              <h3 className="benefit-title">Perfect Pairing</h3>
              <p className="benefit-text">
                AI-powered music recommendations that match your recipe&apos;s
                vibe.
              </p>
            </article>

            <article className="benefit-card">
              <div className="benefit-icon-wrap">
                <div className="benefit-icon">
                  <IconMusic color="#1db954" stroke={2} size={32} />
                </div>
              </div>
              <h3 className="benefit-title">Curated Playlists</h3>
              <p className="benefit-text">
                Save and enjoy your personalized cooking playlists on Spotify.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* =============== FEATURED PAIRINGS (NEW STYLE) =============== */}
      <section id="featured-pairings" className="featured-pairings-new">
        <div className="fp-header">
          <h2>Featured Pairings</h2>
          <p>
            Perfect recipe and playlist combinations to elevate your cooking
            experience
          </p>
        </div>

        <div className="fp-grid">
          {featuredPairings.map((item) => (
            <div
              key={item.id}
              className="fp-card"
              onClick={() => navigate(`/recipe/${item.id}`)}
            >
              {/* Image */}
              <div className="fp-img-wrap">
                <img src={item.image} alt={item.title} className="fp-img" />
                <div className="fp-badge">{item.badge}</div>
              </div>

              {/* Content */}
              <div className="fp-content">
                <h3 className="fp-title">{item.title}</h3>
                <p className="fp-desc">{item.desc}</p>

                <div className="fp-meta">
                  <span className="fp-meta-item">⏱ {item.time}</span>
                  <span className="fp-meta-item">
                    <IconMusic size={16} color="#b3b3b3" />
                    {item.tracks}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="fp-explore-wrapper">
          <button
            className="fp-explore-btn"
            onClick={() => navigate("/recipes")}
          >
            Explore Recipes
          </button>
        </div>
      </section>

      {/* =============== NEWSLETTER (optional) =============== */}
      {/* 
      <section className="section stay-in-tune">
        <div className="stay-inner">
          <h2>Stay in Tune</h2>
          <p>
            Get weekly recipe and playlist pairings delivered straight to your
            inbox.
          </p>

          <div className="stay-form">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
            />
            <button className="subscribe-btn" onClick={handleSubscribe}>
              ✉ Subscribe
            </button>
          </div>
        </div>
      </section>
      */}
    </>
  );
}
