import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MOCK_RECIPES } from "./mockRecipes.js";

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function extractIngredients(userText) {
// Training the bot with examples
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

    Example:
    Input: "What can I cook with rice and eggs?"
    Output: {"ingredients": ["rice", "eggs"]}

    Example:
    Input: "I only have lime juice and garlic"
    Output: {"ingredients": ["lime", "garlic"]}

    Now extract ingredients from:
    "${userText}"
  `;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  // Find the first { ... } block
  const jsonMatch = raw.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.error("Gemini returned non-JSON:", raw);
    return [];
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.ingredients || [];
  } catch (err) {
    console.error("JSON parse error:", raw);
    return [];
  }
}


// This function is an algorithm to match recipes by the given ingredienets
function findMatchingRecipes(ingredients) {
  const terms = ingredients.map(i => i.toLowerCase());

  return MOCK_RECIPES.filter(recipe => {
    return recipe.extendedIngredients.some(item => {
      const cleanItem = item.toLowerCase()
        .replace(/[^a-z\s]/g, "")  // remove numbers, punctuation
        .split(" ")                // break into words
        .filter(Boolean);

      return cleanItem.some(word =>
        terms.some(term =>
          word.includes(term) || term.includes(word)
        )
      );
    });
  });
}



// This routes to how the chatbot gets the request from the user.
router.post("/chat-ingredients", async (req, res) => {
  try {
    const { message } = req.body;

    const ingredients = await extractIngredients(message);
    console.log("Extracted ingredients:", ingredients);

    const recipes = findMatchingRecipes(ingredients);
    console.log("Matched recipes:", recipes);

    const botResponse = ingredients.length
      ? `Based on your ingredients (${ingredients.join(", ")}), here are some ideas!`
      : "I couldn't detect ingredients — try telling me what ingredients you have!";

    res.json({ ingredients, recipes, botResponse });

  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ error: "Chatbot failed" });
  }
});


export default router;
