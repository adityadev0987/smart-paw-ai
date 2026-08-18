import {
  getPetProfile,
  getHealthRecords,
} from "./tools.js";

import { generateHealthInsight } from "../services/llmService.js";

export async function runHealthAgent({
  petId,
  symptoms,
}) {
  if (!petId) {
    throw new Error("Pet ID is required.");
  }

  if (!symptoms?.trim()) {
    throw new Error("Symptoms are required.");
  }

  // 1. Get real pet data from MongoDB
  const pet = await getPetProfile(petId);

  // 2. Get previous health records from MongoDB
  const healthRecords = await getHealthRecords(petId);

  // 3. Send complete health context to the LLM
  const result = await generateHealthInsight({
    pet,
    healthRecords,
    symptoms: symptoms.trim(),
  });

  return {
    pet,
    healthRecords,
    currentSymptoms: symptoms.trim(),
    result,
  };
}