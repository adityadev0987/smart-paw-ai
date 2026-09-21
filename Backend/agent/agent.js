import {
  getPetProfile,
  getHealthRecords,
} from "./tools.js";

import { generateHealthInsight } from "../services/llmService.js";
import runHealthTriage from "../services/healthTriageRules.js";

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

  const currentSymptoms = symptoms.trim();

  // 1. Get complete pet profile + medical context
  const pet = await getPetProfile(petId);

  // 2. Get previous health records
  const healthRecords = await getHealthRecords(petId);

  // 3. Run local triage rules first
  const triage = runHealthTriage({
    message: currentSymptoms,
    petProfile: pet,
    healthRecords,
    conversation,
  });

  /*
   * Emergency signals detected locally.
   *
   * Do not depend on Gemini for obvious emergency signals.
   */
  if (triage.emergency) {
    return {
      pet,
      healthRecords,
      currentSymptoms,

      status: "FINAL",

      question: "",

      assessment:
        "The information provided includes a potentially urgent warning sign. This situation should be assessed promptly by a veterinarian.",

      nextSteps: [
        "Contact a veterinarian or emergency veterinary service promptly.",
        "Keep your pet in a safe, calm environment.",
        "Do not give medication unless it has been specifically recommended by a veterinarian.",
      ],

      urgent: true,

      triage: {
        level: triage.level,
        emergencySignals: triage.emergencySignals,
      },
    };
  }

  /*
   * 4. Gemini is used only after local safety checks.
   *
   * It receives the COMPLETE pet medical context,
   * health records and conversation.
   */
  let aiResponse;

  try {
    aiResponse = await generateHealthInsight({
      pet,
      healthRecords,
      symptoms: currentSymptoms,
      conversation,

      triage: {
        level: triage.level,
        medicalSignals: triage.medicalSignals,
        suggestedFollowUp:
          triage.suggestedFollowUp,
      },
    });
  } catch (error) {
    console.error(
      "Health AI unavailable, using local fallback:",
      error,
    );

    /*
     * Gemini/API unavailable.
     * Health Check should still work.
     */
    if (triage.suggestedFollowUp) {
      return {
        pet,
        healthRecords,
        currentSymptoms,

        status: "FOLLOW_UP",

        question:
          triage.suggestedFollowUp.suggestedQuestion,

        assessment:
          "I need a little more information before I can assess this concern safely.",

        nextSteps: [],

        urgent: false,

        triage: {
          level: triage.level,
          source: "local",
        },
      };
    }

    return {
      pet,
      healthRecords,
      currentSymptoms,

      status: "FINAL",

      question: "",

      assessment:
        "I could not complete the full AI assessment right now. No predefined emergency warning sign was detected from the information provided, but this does not rule out a medical problem.",

      nextSteps: [
        "Monitor your pet closely for changes.",
        "Contact a veterinarian if symptoms persist, worsen, or new warning signs appear.",
      ],

      urgent: false,

      triage: {
        level: triage.level,
        source: "local",
      },
    };
  }

  /*
   * 5. Safety normalization
   *
   * Never allow an AI response to remove urgency
   * if our local rules already detected a concern.
   */

  const safeUrgent =
    triage.level === "RED"
      ? true
      : Boolean(aiResponse.urgent);

  return {
    pet,
    healthRecords,
    currentSymptoms,

    status:
      aiResponse.status === "FOLLOW_UP"
        ? "FOLLOW_UP"
        : "FINAL",

    question:
      aiResponse.question || "",

    assessment:
      aiResponse.assessment || "",

    nextSteps:
      Array.isArray(aiResponse.nextSteps)
        ? aiResponse.nextSteps
        : [],

    urgent: safeUrgent,

    triage: {
      level: triage.level,
      medicalSignals: triage.medicalSignals,
      source: "local+ai",
    },
  };
}