import express from "express";
import {
  getAllRecipes,
  getRecipeById,
  createRecipe,
} from "../controllers/recipesController.js";

const router = express.Router();

// post/create new recipe
router.post("/", createRecipe);

// get all recipes
router.get("/", getAllRecipes);

// get single recipe by ID
router.get("/:id", getRecipeById);


export default router;