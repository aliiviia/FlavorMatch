import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function AppLayout() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("spotify_token");

    if (token) {
      fetch(`http://localhost:5001/me?token=${token}`)
        .then((res) => res.json())
        .then((data) => {
          setUser(data); // store Spotify user info here
        })
        .catch((err) => {
          console.error("Could not load Spotify user:", err);
        });
    }
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
