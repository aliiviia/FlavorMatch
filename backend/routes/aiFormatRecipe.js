import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/format-recipe", async (req, res) => {
  try {
    const { title, ingredients, steps } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
You are a culinary assistant. Rewrite the user's recipe in clean JSON.
DO NOT include markdown or extra text. Only return valid JSON.

Format strictly like this:
{
  "title": "New Title",
  "ingredients": ["item1", "item2"],
  "instructions": ["step1", "step2"]
}

User's Recipe:
Title: ${title}
Ingredients: ${ingredients}
Steps: ${steps}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Remove backticks or markdown if Gemini adds them
    const cleaned = text.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(cleaned);

    res.json({ formattedRecipe: parsed });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "AI failed to format recipe" });
  }
});

export default router;
