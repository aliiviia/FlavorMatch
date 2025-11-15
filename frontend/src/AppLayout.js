import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function AppLayout() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromURL = params.get("token");

    if (tokenFromURL) {
      localStorage.setItem("spotify_token", tokenFromURL);
      window.history.replaceState({}, document.title, "/"); // Clean URL
    }

    const token = tokenFromURL || localStorage.getItem("spotify_token");
    if (!token) return;

    //  Fetch Spotify profile from your backend
    fetch(`http://localhost:5001/me?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        setUser({
          display_name: data.display_name,
          image: data.images?.[0]?.url,  // Gets spotify users  profile photo
        });
      })
      .catch((err) => {
        console.error("Could not load Spotify user:", err);
      });
  }, []);

  return (
    <div className="app-shell">
      <Navbar user={user} />
      <main className="page-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
