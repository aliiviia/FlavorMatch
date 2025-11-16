import { pool } from "../db/index.js";

// create a user-created recipe
export const createRecipe = async (req, res) => {
    const {
      recipe_name,
      description,
      instructions,
      ingredients,
      creator,
      image,
      source,
      spoonacular_id
    } = req.body;
  
    try {
      const result = await pool.query(
        `INSERT INTO recipes 
          (recipe_name, description, instructions, ingredients, creator, image, source, spoonacular_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          recipe_name,
          description,
          instructions,
          ingredients,
          creator,
          image,
          source,
          spoonacular_id || null
        ]
      );
  
      res.status(201).json({
        message: "Recipe created successfully",
        recipe: result.rows[0],
      });
    } catch (err) {
      console.error("cant create recipe:", err.message);
      res.status(500).json({ error: "Failed to create recipe" });
    }
  };

//fetch all recipes
export const getAllRecipes = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM recipes ORDER BY recipe_id ASC;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Cannot fetch all recipes:", err.message);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
};

// fetch single recipe
export const getRecipeById = async (req, res) => {
  const recipeId = req.params.id;

  try {
    const result = await pool.query(
      `SELECT * FROM recipes WHERE recipe_id = $1`,
      [recipeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Could not fetch recipe:", err.message);
    res.status(500).json({ error: "Failed to fetch recipe" });
  }
};
