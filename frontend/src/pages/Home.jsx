// src/pages/Home.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const featuredPairings = [
  {
    id: 1,
    title: "Creamy Tuscan Chicken",
    desc: "Rich, comforting flavors with smooth, romantic tunes.",
    image: "https://images.pexels.com/photos/4106483/pexels-photo-4106483.jpeg",
    badge: "🍗 Comfort",
    time: "30 min",
    tracks: "3 songs",
  },
  {
    id: 2,
    title: "Spicy Thai Basil Noodles",
    desc: "Bold spice with energetic, modern beats.",
    image: "https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg",
    badge: "🔥 Spice",
    time: "25 min",
    tracks: "3 songs",
  },
  {
    id: 3,
    title: "Classic Margherita Pizza",
    desc: "Laid-back Italian vibes for a cozy night in.",
    image: "https://images.pexels.com/photos/4109990/pexels-photo-4109990.jpeg",
    badge: "🍕 Classic",
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
      {/* =============== HERO - Exact match to screenshot 1 =============== */}
      <section className="hero">
        <div className="hero-inner hero-inner-centered">
          {/* Icon row with green glow effect */}
          <div className="hero-icons">
            <div className="hero-icon-wrapper">
              <div className="hero-icon-glow">👨‍🍳</div>
            </div>
            <div className="hero-icon-wrapper">
              <div className="hero-icon-glow">✨</div>
            </div>
            <div className="hero-icon-wrapper">
              <div className="hero-icon-glow">🎵</div>
            </div>
          </div>

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

          <div className="hero-actions">
            <button 
              type="button" 
              className="primary-btn"
              onClick={() => navigate("/recipes")}
            >
              <span className="btn-icon">🍽</span>
              Explore Recipes
            </button>
            
            <button 
              type="button" 
              className="secondary-btn"
              onClick={() => console.log("Connect Spotify")}
            >
              <span className="spotify-icon">🎵</span>
              Connect Spotify
            </button>
          </div>
        </div>
      </section>

      {/* =============== How It Works Cards - Exact match to screenshot 2 =============== */}
      <section className="section benefits-section">
        <div className="benefits-inner">
          <div className="benefits-grid">
            <article className="benefit-card">
              <div className="benefit-icon-wrap">
                <div className="benefit-icon">👨‍🍳</div>
              </div>
              <h3 className="benefit-title">Discover Recipes</h3>
              <p className="benefit-text">
                Browse thousands of delicious recipes from cuisines around the world
              </p>
            </article>

            <article className="benefit-card">
              <div className="benefit-icon-wrap">
                <div className="benefit-icon">✨</div>
              </div>
              <h3 className="benefit-title">Perfect Pairing</h3>
              <p className="benefit-text">
                AI-powered music recommendations that match your recipe's vibe
              </p>
            </article>

            <article className="benefit-card">
              <div className="benefit-icon-wrap">
                <div className="benefit-icon">🎵</div>
              </div>
              <h3 className="benefit-title">Curated Playlists</h3>
              <p className="benefit-text">
                Save and enjoy your personalized cooking playlists on Spotify
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* =============== Featured Pairings with unique styling =============== */}
      <section id="featured-pairings" className="section featured-pairings">
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
                      e.stopPropagation();
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
        
        <div style={{ textAlign: 'center' }}>
          <button 
            className="outline-dark-btn"
            onClick={() => navigate("/recipes")}
          >
            Explore All Recipes
          </button>
        </div>
      </section>

      {/* =============== Stay In Tune Newsletter =============== */}
      <section className="section stay-in-tune">
        <div className="stay-inner">
          <h2>Stay in Tune</h2>
          <p>
            Get weekly recipe and playlist pairings delivered straight to your inbox.
          </p>
          
          <div className="stay-form">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubscribe();
              }}
            />
            <button className="subscribe-btn" onClick={handleSubscribe}>
              ✉ Subscribe
            </button>
          </div>
        </div>
      </section>
    </>
  );
}