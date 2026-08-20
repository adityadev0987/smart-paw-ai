import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import petRoutes from "./routes/petRoutes.js";
import healthRecordRoutes from "./routes/healthRecordRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import vetRoutes from "./routes/vetRoutes.js";
import { protect } from "./middleware/authMiddleware.js";

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

app.use("/api/auth", authRoutes);

app.get("/api/auth/test", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication middleware is working.",
    userId: req.user.id,
  });
});

app.use("/api/pets", petRoutes);
app.use("/api/health-records", healthRecordRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/vets", vetRoutes);

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(
      `Smart Paw AI backend running on port ${PORT}`,
    );
  });
}

startServer();