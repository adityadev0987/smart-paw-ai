import express from "express";

import {
  createPet,
  getPets,
  getPetById,
  updatePet,
  deletePet,
  updatePetProfilePhoto,
} from "../controllers/petController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createPet);

router.get("/", protect, getPets);

router.get("/:id", protect, getPetById);

router.put("/:id", protect, updatePet);
router.patch("/:id/photo", protect, updatePetProfilePhoto);

router.delete("/:id", protect, deletePet);

export default router;
