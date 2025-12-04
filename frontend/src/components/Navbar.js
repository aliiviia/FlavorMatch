import { NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
const API_URL = process.env.REACT_APP_BACKEND_URL;
import {
  IconChefHat,
  IconToolsKitchen2
} from "@tabler/icons-react";

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
          <div className="nav-logo-icon flex items-center gap-1">
            <IconToolsKitchen2 color="#1db954" stroke={2} size={26} />
            <IconChefHat color="#1db954" stroke={2} size={26} />
            
          </div>

          <span className="nav-logo-text">FlavorMatch</span>
        </NavLink>

        <nav className="nav-links">

          {/* Main navigation links */}
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
                src={user.image || "/spotify-logo.png"}
                alt="Spotify Profile"
                className="spotify-profile-img"
                onError={(e) => {
                  e.currentTarget.onerror = null; 
                  e.currentTarget.src = "/spotify-logo.png";
                }}
              />

              {/* Dropdown menu */}
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
                window.location.href = `${API_URL}/login`;
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
