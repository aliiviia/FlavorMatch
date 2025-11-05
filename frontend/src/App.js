import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import RecipeDetails from "./pages/RecipeDetails.jsx";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 🔹 Home route — search + display multiple recipes */}
          <Route path="/" element={<Home />} />

          {/* 🔹 Recipe details route — detailed info + matching song */}
          <Route path="/recipe/:id" element={<RecipeDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
