import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("FlavorMatch backend is running!");
});

//Testing endpoint
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from FlavorMatch backend!" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
