import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import AppLayout from "./AppLayout";
import Home from "./pages/Home.jsx";
import RecipeDetails from "./pages/RecipeDetails.jsx";
import ExploreRecipesPage from "./pages/ExploreRecipesPage.js";
import FavoritesPage from "./pages/FavoritesPage.js";
import CreateRecipePage from "./pages/CreateRecipePage.js";
import CustomRecipePage from "./pages/CustomRecipePage.js";
import ExploreCustomRecipesPage from "./pages/ExploreCustomRecipePage.js";
import FloatingChatBot from "./components/FloatingChatBot";
import "./styles/Global.css";
import "./styles/Layout.css";

export default function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("access_token");

    if (token) {
      localStorage.setItem("spotify_token", token);
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  return (
    <>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<ExploreRecipesPage />} />
          <Route path="/recipe/:id" element={<RecipeDetails />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/custom" element={<CustomRecipePage />} />
          <Route path="/create" element={<CreateRecipePage />} />
          <Route path="/explore" element={<ExploreCustomRecipesPage />} />
        </Route>
      </Routes>

      {/* Floating chatbot */}
      <FloatingChatBot />
    </>
  );
}
