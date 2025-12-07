import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/format-recipe", async (req, res) => {
  try {
    const { title, ingredients, steps } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
You are a culinary assistant. Rewrite the user's recipe in a clean, professional format.
Return clear sections: Title, Ingredients (bulleted), Steps (numbered).

User's Recipe:
Title: ${title}
Ingredients: ${ingredients}
Steps: ${steps}
    `;

    const result = await model.generateContent(prompt);
    const aiText = result.response.text();

    res.json({ formattedRecipe: aiText });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "AI failed to format recipe" });
  }
});

export default router;
