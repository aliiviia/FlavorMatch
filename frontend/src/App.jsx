import { Routes, Route } from "react-router-dom";
import AppLayout from "./AppLayout";
import Home from "./pages/Home.jsx";
import RecipeDetails from "./pages/RecipeDetails.jsx";
import ExploreRecipesPage from "./pages/ExploreRecipesPage.js";
import FavoritesPage from "./pages/FavoritesPage.js";
import CreateRecipePage from "./pages/CreateRecipePage.js";
import CustomRecipePage from "./pages/CustomRecipePage.js";
import ExploreCustomRecipesPage from "./pages/ExploreCustomRecipePage.js";
import "./App.css";

export default function App() {
  return (
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
  );
}
