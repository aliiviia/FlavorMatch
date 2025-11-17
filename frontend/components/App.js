import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import AppLayout from "../src/AppLayout";
import Home from "../src/pages/Home";
import RecipeDetails from "../src/pages/RecipeDetails";
import ExploreRecipesPage from "../src/pages/ExploreRecipesPage";
import FavoritesPage from "../src/pages/FavoritesPage";
import CreateRecipePage from "../src/pages/CreateRecipePage";
import "./App.css";

function App() {
  // ---- Spotify login token handling ----
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("access_token");   

    if (token) {
      localStorage.setItem("spotify_token", token);
      console.log("User logged in with Spotify:", token);

      window.history.replaceState({}, document.title, "/");
    }
  }, []);
  // --------------------------------------

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/recipes" element={<ExploreRecipesPage />} />
        <Route path="/recipe/:id" element={<RecipeDetails />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/create" element={<CreateRecipePage />} />
      </Route>
    </Routes>
  );
}

export default App;
