// src/pages/FavoritesPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const savedPairings = [
  {
    id: 1,
    title: "Creamy Tuscan Chicken",
    image: "https://images.pexels.com/photos/4106483/pexels-photo-4106483.jpeg",
    songs: ["Italian Romance", "Mediterranean Dreams", "Tuscan Sunset"],
    active: true
  },
  {
    id: 2,
    title: "Spicy Thai Basil Noodles",
    image: "https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg",
    songs: ["Bangkok Nights", "Asian Fusion", "Spice Market"],
    active: false
  },
  {
    id: 3,
    title: "Classic Margherita Pizza",
    image: "https://images.pexels.com/photos/4109990/pexels-photo-4109990.jpeg",
    songs: ["Naples Dreams", "Italian Classics", "Pizza Party"],
    active: false
  }
];

export default function FavoritesPage() {
  const [pairings, setPairings] = useState(savedPairings);
  const navigate = useNavigate();

  const handleRemove = (id) => {
    setPairings(pairings.filter(p => p.id !== id));
  };

  const handleOpenSpotify = (id) => {
    // Open in Spotify logic
    console.log("Opening in Spotify:", id);
  };

  return (
    <main className="favorites-page">
      <div className="favorites-container">
        {/* Header Section */}
        <header className="favorites-header">
          <div className="header-icon">🎵</div>
          <h1 className="favorites-title">
            Your <span className="title-green">Cooking Playlist</span>
          </h1>
          <p className="favorites-subtitle">
            All your recipe-inspired music in one place
          </p>
        </header>

        {/* Connect Spotify Card */}
        <section className="spotify-connect-section">
          <div className="spotify-connect-card">
            <div className="spotify-icon-large">🎵</div>
            <h2 className="connect-title">Connect Spotify to Play</h2>
            <p className="connect-description">
              Link your Spotify account to stream your cooking playlist directly here
            </p>
            <button className="spotify-connect-btn">
              <span className="btn-icon">🎵</span>
              Connect Spotify
            </button>
          </div>
        </section>

        {/* Recipe-Song Pairings */}
        <section className="pairings-section">
          <h2 className="pairings-heading">Recipe-Song Pairings</h2>
          
          <div className="pairings-list">
            {pairings.map((pairing) => (
              <article 
                key={pairing.id} 
                className={`pairing-card ${pairing.active ? 'active' : ''}`}
              >
                <div className="pairing-content">
                  <img
                    src={pairing.image}
                    alt={pairing.title}
                    className="pairing-image"
                  />
                  
                  <div className="pairing-info">
                    <h3 className="pairing-title">{pairing.title}</h3>
                    <ul className="pairing-songs">
                      {pairing.songs.map((song, index) => (
                        <li key={index} className="song-item">
                          <span className="song-icon">🎵</span>
                          {song}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="pairing-actions">
                  <button 
                    className="action-btn"
                    onClick={() => handleOpenSpotify(pairing.id)}
                    title="Open in Spotify"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </button>
                  
                  <button 
                    className="action-btn"
                    onClick={() => handleRemove(pairing.id)}
                    title="Remove"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}