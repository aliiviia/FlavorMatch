import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function AppLayout() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("spotify_token");
    if (!token) return;

    fetch("http://127.0.0.1:5001/me", {
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
