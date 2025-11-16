
import { pool } from "../db/index.js";

// get favorites
export const getFavorites = async (req, res) => {
  const userId = req.params.user_id;

  try {
    const result = await pool.query(
      `SELECT r.* 
       FROM favorites f
       JOIN recipes r ON f.recipe_id = r.recipe_id
       WHERE f.user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("error fetching favorites:", err.message);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
};

// post/add a favorite
export const addFavorite = async (req, res) => {
  const { user_id, recipe_id } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO favorites (user_id, recipe_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [user_id, recipe_id]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ message: "Favorite already exists" });
    }

    res.status(201).json({
      message: "Favorite added",
      favorite: result.rows[0],
    });
  } catch (err) {
    console.error("error adding favorite:", err.message);
    res.status(500).json({ error: "Failed to add favorite" });
  }
};

// delete a favorite
export const deleteFavorite = async (req, res) => {
  const { user_id, recipe_id } = req.body;

  try {
    const result = await pool.query(
      `DELETE FROM favorites 
       WHERE user_id = $1 AND recipe_id = $2
       RETURNING *`,
      [user_id, recipe_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Favorite not found" });
    }

    res.json({ message: "Favorite removed" });
  } catch (err) {
    console.error("Error deleting favorite:", err.message);
    res.status(500).json({ error: "Failed to delete favorite" });
  }
};