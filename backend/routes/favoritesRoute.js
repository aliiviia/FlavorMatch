import express from "express";
import {
  getFavorites,
  addFavorite,
  deleteFavorite,
} from "../controllers/favoritesController.js";

const router = express.Router();

// get all favorites
router.get("/:user_id", getFavorites);

// Add favorite
router.post("/", addFavorite);

// Delete favorite
router.delete("/", deleteFavorite);

export default router;