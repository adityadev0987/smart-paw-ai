
import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";

import petRoutes from "./routes/petRoutes.js";
import healthRecordRoutes from "./routes/healthRecordRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import vetRoutes from "./routes/vetRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import consultationRoutes from "./routes/consultationRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

import { initializeRealtime } from "./services/realtime.js";
import { protect } from "./middleware/authMiddleware.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const frontendDistPath = path.resolve(
  __dirname,
  "../Frontend/dist"
);

app.use(cors());
app.use(express.json());

// Existing upload restrictions
app.use("/uploads/consultations", (req, res) =>
  res.status(404).end()
);
app.use("/uploads/ai-health", (req, res) =>
  res.status(404).end()
);
app.use("/uploads/reports", (req, res) =>
  res.status(404).end()
);

// Existing uploads directory
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// Serve React frontend assets
app.use(express.static(frontendDistPath));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Smart Paw AI API is healthy",
  });
});

// Authentication
app.use("/api/auth", authRoutes);

app.get("/api/auth/test", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication middleware is working.",
    userId: req.user.id,
  });
});

// Application APIs
app.use("/api/pets", petRoutes);
app.use("/api/health-records", healthRecordRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/vets", vetRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/uploads", uploadRoutes);

// React Router fallback
app.use((req, res, next) => {
  if (
    req.method !== "GET" ||
    req.path.startsWith("/api/") ||
    req.path.startsWith("/uploads/")
  ) {
    return next();
  }

  res.sendFile(
    path.join(frontendDistPath, "index.html"),
    (err) => {
      if (err && !res.headersSent) {
        next(err);
      }
    }
  );
});

// Start server
async function startServer() {
  await connectDB();

  const server = http.createServer(app);

  initializeRealtime(server, app);

  server.listen(PORT, () => {
    console.log(
      `Smart Paw AI backend running on port ${PORT}`
    );
  });
}

startServer();
