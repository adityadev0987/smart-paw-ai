import dotenv from "dotenv";
import mongoose from "mongoose";

import Pet from "../models/Pet.js";

dotenv.config({
  path: "./Backend/.env",
});

const PET_ID = "6a849cfad40121352f3c4540";
const USER_ID = "6a85f9c27c28543fabfc2dc9";

async function assignBrunoToUser() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not loaded from Backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected.");

    const pet = await Pet.findById(PET_ID);

    if (!pet) {
      throw new Error("Bruno pet not found.");
    }

    pet.userId = USER_ID;

    await pet.save();

    console.log("Bruno successfully assigned to test user.");

    console.log({
      petId: pet._id.toString(),
      petName: pet.name,
      userId: pet.userId.toString(),
    });
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

assignBrunoToUser();