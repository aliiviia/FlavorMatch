import { pool } from "./index.js";

const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE users (
        user_id SERIAL PRIMARY KEY,
        spotify_id TEXT UNIQUE,
        access_token TEXT,
        refresh_token TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE recipes (
        recipe_id SERIAL PRIMARY KEY,
        recipe_name TEXT,
        description TEXT,
        instructions TEXT,
        ingredients JSONB,
        creator INT REFERENCES users(user_id),
        image TEXT,
        source TEXT,
        creation_date TIMESTAMP DEFAULT NOW(),
        spoonacular_id INT,
        linked_playlist INT
      );

      CREATE TABLE playlists (
        playlist_id SERIAL PRIMARY KEY,
        spotify_playlist_id TEXT,
        linked_recipe_id INT REFERENCES recipes(recipe_id),
        playlist_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE favorites (
        user_id INT REFERENCES users(user_id),
        recipe_id INT REFERENCES recipes(recipe_id),
        created_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (user_id, recipe_id)
      );
    `);

    console.log("Tables created");
  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    pool.end();
  }
};

createTables();