import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
const API_URL = import.meta.env.VITE_BACKEND_URL;

export default function AppLayout() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("spotify_token");
    if (!token) return;

    fetch("${API_URL}/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.log(err));
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
