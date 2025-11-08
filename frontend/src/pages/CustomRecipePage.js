import { useNavigate } from "react-router-dom";

export default function CustomRecipePage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-5xl font-bold text-gray-800 mb-12 text-center">
        Custom Recipes 🍽️
      </h1>

      <h2>Would you like to:    </h2>

      <div className="flex flex-col sm:flex-row gap-10">
        <div
          onClick={() => navigate("/create")}
        >
          Create
        </div>

        <div
          onClick={() => navigate("/explore")}
        >
          Explore
        </div>
      </div>
    </main>
  );
}
