import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MOCK_RECIPES } from "./mockRecipes.js";
const router = express.Router();
const API_URL = process.env.REACT_APP_BACKEND_URL;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function extractIngredients(userText) {
  const prompt = `
You extract cooking ingredients from user text.

✔ Return STRICT JSON.
✔ No explanation.
✔ No markdown.
✔ No backticks.

Format:
{
  "ingredients": ["ingredient1", "ingredient2"]
}

Example:
Input: "I have chicken, garlic, and tomato"
Output: {"ingredients": ["chicken", "garlic", "tomato"]}

Now extract ingredients from:
"${userText}"
`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return [];

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.ingredients || [];
  } catch (err) {
    console.error("JSON parse error:", raw);
    return [];
  }
}

/* ------------------------------------------------------
   2️⃣ LOCAL INGREDIENT MATCHING (MOCK DATA)
------------------------------------------------------ */
function findMatchingRecipes(ingredients) {
  const terms = ingredients.map((i) => i.toLowerCase());

  return MOCK_RECIPES.filter((recipe) => {
    return recipe.extendedIngredients.some((item) => {
      const cleanItem = item
        .toLowerCase()
        .replace(/[^a-z\s]/g, "")
        .split(" ")
        .filter(Boolean);

      return cleanItem.some((word) =>
        terms.some(
          (term) => word.includes(term) || term.includes(word)
        )
      );
    });
  });
}

router.post("/chat-ingredients", async (req, res) => {
  try {
    const { message } = req.body;

    /* --- A) Extract ingredients from text --- */
    const ingredients = await extractIngredients(message);
    console.log("Extracted Ingredients:", ingredients);

    if (!ingredients.length) {
      return res.json({
        botResponse:
          "I couldn't detect any ingredients. Try listing them again!",
        recipes: [],
      });
    }

    /* --- B) Match recipes from MOCK data --- */
    const mockMatches = findMatchingRecipes(ingredients);

    /* --- C) Match recipes from Spoonacular via backend --- */
    let spoonMatches = [];
    try {
      const spoonRes = await fetch(`${API_URL}/api/searchByIngredients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      });

      const spoonData = await spoonRes.json();
      spoonMatches = spoonData.results || [];
    } catch (err) {
      console.error("Spoonacular fetch failed:", err);
    }

    /* --- D) Format recipes for chatbot --- */
    const formattedMock = mockMatches.map((r) => ({
      id: r.id,
      title: r.title,
      source: "mock",
    }));

    const formattedSpoon = spoonMatches.map((r) => ({
      id: r.id,
      title: r.title,
      source: "spoonacular",
    }));

    const combined = [...formattedMock, ...formattedSpoon].slice(0, 10);

    /* --- E) Choose bot reply text --- */
    const reply =
      combined.length > 0
        ? `Based on ${ingredients.join(
            ", "
          )}, here are some recipes you can make:`
        : `I didn’t find recipes using those exact ingredients. Try adding more items!`;

    /* --- F) Send response --- */
    return res.json({
      botResponse: reply,
      recipes: combined,
    });
  } catch (err) {
    console.error("Chatbot error:", err);

    return res.json({
      botResponse:
        "Sorry, something went wrong analyzing your ingredients.",
      recipes: [],
    });
  }
});

export default router;
