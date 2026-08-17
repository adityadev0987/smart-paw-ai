import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart Paw AI Backend is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Smart Paw AI API is healthy",
  });
});

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Smart Paw AI backend running on port ${PORT}`);
  });
}

startServer();