import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const access = params.get("access_token");
    const refresh = params.get("refresh_token");

    if (access) {
      localStorage.setItem("spotify_token", access);
    }

    if (refresh) {
      localStorage.setItem("spotify_refresh", refresh);
    }

    navigate("/"); // redirect home
  }, []);

  return <p>Connecting to Spotify…</p>;
}
