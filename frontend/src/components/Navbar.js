import { NavLink } from "react-router-dom";

export default function Navbar() {
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
            to="/create"
            className={({ isActive }) => (isActive ? active : linkBase)}
          >
            Create Recipe
          </NavLink>

          <button className="spotify-btn">⏺ Connect Spotify</button>
        </nav>
      </div>
    </header>
  );
}
