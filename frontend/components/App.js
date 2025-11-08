import { Routes, Route } from "react-router-dom";
import AppLayout from "../src/AppLayout";
import Home from "../src/pages/Home";
import RecipeDetails from "../src/pages/RecipeDetails";
import ExploreRecipesPage from "../src/pages/ExploreRecipesPage";
import FavoritesPage from "../src/pages/FavoritesPage";
import CreateRecipePage from "../src/pages/CreateRecipePage";
import "./App.css";

function App() {
  return (
    <Routes>
      {/* All pages share Navbar + Footer via AppLayout */}
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
