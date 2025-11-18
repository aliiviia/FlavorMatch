import pkg from "pg";           
import dotenv from "dotenv";      
dotenv.config();                 

const { Pool } = pkg;          
 
const isLocal = process.env.NODE_ENV !== "production";

 
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

(async () => {
    try {
      const res = await pool.query("SELECT NOW()");
      console.log("✅ Database connected successfully at:", res.rows[0].now);
    } catch (err) {
      console.error("DATABASE CONNECTION FAILED");
      console.error("Error message:", err.message);
  
      // SSL Problem
      if (err.message.includes("SSL")) {
        console.error("local DB doesn't support SSL. Set ssl: false");
      }
  
      // DB nonexistrent
      if (err.message.includes("does not exist")) {
        console.error("The database you are connecting to does not exist.");
        console.error("createdb flavormatch");
      }
  
      // credentials wrong
      if (err.message.includes("password")) {
        console.error("Incorrect DB username or password in .env");
      }
  
      // host unreachable
      if (err.message.includes("ECONNREFUSED")) {
        console.error("Postgres is not running or wrong localhost port.");
        console.error("Start Postgres or check your port number");
      }
  
      // env missing
      if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL is missing from your .env file");
        console.error("Add DATABASE_URL before running backend");
      }
    }
  })();