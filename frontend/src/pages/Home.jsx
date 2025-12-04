// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconChefHat, IconSparkles, IconMusic } from "@tabler/icons-react";
import "../styles/Home.css";

export default function Home() {
  const [email, setEmail] = useState("");
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const navigate = useNavigate();

  const handleSubscribe = () => {
    if (!email) return;
    alert(`Thank you for subscribing with ${email}!`);
    setEmail("");
  };

  // ---- Load real recipes for Featured Pairings ----
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5001/api/recipes");
        if (!res.ok) throw new Error("Failed to load recipes");

        const data = await res.json();

        // Take first 3 recipes (or fewer if not available)
        const picked = (data || []).slice(0, 3).map((r) => ({
          id: r.id,
          title: r.title,
          image: r.image,
          readyInMinutes: r.readyInMinutes,
        }));

        setFeaturedRecipes(picked);
      } catch (err) {
        console.error("Error loading featured recipes:", err);
        // optional: could fall back to nothing or some mock data
        setFeaturedRecipes([]);
      }
    };

    fetchFeatured();
  }, []);

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

      {/* =============== FEATURED PAIRINGS (REAL RECIPES) =============== */}
      <section id="featured-pairings" className="featured-pairings-new">
        <div className="fp-header">
          <h2>Featured Pairings</h2>
          <p>
            Perfect recipe and playlist combinations to elevate your cooking
            experience
          </p>
        </div>

        {featuredRecipes.length > 0 && (
          <div className="fp-grid">
            {featuredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="fp-card"
                onClick={() => navigate(`/recipe/${recipe.id}`)}
              >
                {/* Image */}
                <div className="fp-img-wrap">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="fp-img"
                  />
                  <div className="fp-badge">Recipe</div>
                </div>

                {/* Content */}
                <div className="fp-content">
                  <h3 className="fp-title">{recipe.title}</h3>
                  <p className="fp-desc">
                    Tap to view the full recipe and its music pairing.
                  </p>

                  <div className="fp-meta">
                    {recipe.readyInMinutes && (
                      <span className="fp-meta-item">
                        ⏱ {recipe.readyInMinutes} min
                      </span>
                    )}
                    <span className="fp-meta-item">
                      <IconMusic size={16} color="#b3b3b3" />
                      Playlist match
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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