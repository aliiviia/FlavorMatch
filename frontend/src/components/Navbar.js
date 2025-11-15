import { NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

export default function Navbar({ user }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="nav">
      <div className="nav-inner">
        <NavLink to="/" className="nav-logo">
          <span className="nav-logo-icon">🍴</span>
          <span className="nav-logo-text">FlavorMatch</span>
        </NavLink>

        <nav className="nav-links">

          {/* Your nav links here */}
          <NavLink to="/" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Home
          </NavLink>

          <NavLink to="/recipes" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Explore Recipes
          </NavLink>

          <NavLink to="/favorites" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Favorites
          </NavLink>

          <NavLink to="/custom" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Custom Recipe
          </NavLink>

          {/* Spotify Profile Dropdown */}
          {user ? (
            <div
              className="spotify-profile-wrapper"
              onClick={() => setOpen((prev) => !prev)}
              ref={dropdownRef}
            >
              <img
                src={user.image}
                alt="Spotify Profile"
                className="spotify-profile-img"
              />

              {/* Dropdown */}
              <div className={`spotify-dropdown ${open ? "open" : ""}`}>
                <button
                  onClick={() => {
                    localStorage.removeItem("spotify_token");
                    window.location.reload();
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button
              className="spotify-btn"
              onClick={() => {
                window.location.href = "http://127.0.0.1:5001/login";
              }}
            >
              Connect Spotify
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
