import {
  getPetProfile,
  getHealthRecords,
} from "./tools.js";

import { generateHealthInsight } from "../services/llmService.js";

export async function runHealthAgent({
  petId,
  symptoms,
  conversation = [],
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

  // 3. Send complete context + conversation history to the LLM
  const aiResponse = await generateHealthInsight({
    pet,
    healthRecords,
    symptoms: symptoms.trim(),
    conversation,
  });

  return {
    pet,
    healthRecords,
    currentSymptoms: symptoms.trim(),
    status: aiResponse.status,
    question: aiResponse.question,
    assessment: aiResponse.assessment,
    nextSteps: aiResponse.nextSteps,
    urgent: aiResponse.urgent,
  };
}