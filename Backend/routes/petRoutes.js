import express from "express";

import {
  createPet,
  getPets,
  getPetById,
  updatePet,
  deletePet,
} from "../controllers/petController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createPet);

router.get("/", protect, getPets);

router.get("/:id", protect, getPetById);

router.put("/:id", protect, updatePet);

router.delete("/:id", protect, deletePet);

export default router;