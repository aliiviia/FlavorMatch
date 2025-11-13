import { NavLink } from "react-router-dom";

export default function Navbar({ user }) {
  const linkBase = "nav-link";
  const active = "nav-link active";

  return (
    <header className="nav">
      <div className="nav-inner">
        <NavLink to="/" className="nav-logo">
          <span className="nav-logo-icon">🍴</span>
          <span className="nav-logo-text">FlavorMatch</span>
        </NavLink>

        <nav className="nav-links">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? active : linkBase)}
          >
            Home
          </NavLink>

          <NavLink
            to="/recipes"
            className={({ isActive }) => (isActive ? active : linkBase)}
          >
            Explore Recipes
          </NavLink>

          <NavLink
            to="/favorites"
            className={({ isActive }) => (isActive ? active : linkBase)}
          >
            Favorites
          </NavLink>

          <NavLink
            to="/custom"
            className={({ isActive }) => (isActive ? active : linkBase)}
          >
            Custom Recipe
          </NavLink>

          {/* Login or User Greeting */}
          {user ? (
            <span className="nav-user">Welcome, {user.display_name}</span>
          ) : (
            <button
              className="spotify-btn"
              onClick={() => {
                window.location.href = "http://localhost:5001/login";
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
