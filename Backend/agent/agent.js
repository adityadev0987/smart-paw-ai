import {
  getPetProfile,
  getHealthRecords,
} from "./tools.js";

import { generateHealthInsight } from "../services/llmService.js";
import runHealthTriage from "../services/healthTriageRules.js";

const normalizeQuestion = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[?!.:,;]+/g, "")
    .replace(/\s+/g, " ")
    .trim();

const hasAskedQuestion = (conversation, question) => {
  const normalizedQuestion = normalizeQuestion(question);

  if (!normalizedQuestion) {
    return false;
  }

  return conversation.some(
    (message) =>
      message?.role === "assistant" &&
      normalizeQuestion(message.content) === normalizedQuestion,
  );
};

/*
 * These are user-safe processing stages.
 *
 * We do NOT expose private model reasoning or chain-of-thought.
 * These stages simply tell the user which part of the health
 * check pipeline is being processed.
 */
const buildProcessingSteps = ({
  petProfile = "completed",
  medicalRecords = "completed",
  healthHistory = "completed",
  safetyCheck = "completed",
  veterinaryKnowledge = "completed",
  analysis = "completed",
} = {}) => [
  {
    id: "pet_profile",
    label: "Checking pet profile",
    status: petProfile,
  },

  {
    id: "medical_records",
    label: "Reviewing medical records",
    status: medicalRecords,
  },

  {
    id: "health_history",
    label: "Reviewing previous health history",
    status: healthHistory,
  },

  {
    id: "safety_check",
    label: "Checking health safety signals",
    status: safetyCheck,
  },

  {
    id: "veterinary_knowledge",
    label: "Reviewing relevant pet health information",
    status: veterinaryKnowledge,
  },

  {
    id: "analysis",
    label: "Analyzing the current concern",
    status: analysis,
  },
];

const buildConversationFallback = ({
  pet,
  healthRecords,
  currentSymptoms,
  triage,
  processingSteps,
}) => ({
  pet,
  healthRecords,
  currentSymptoms,

  status: "FINAL",

  question: "",

  assessment:
    "I have enough information to give a cautious initial assessment, but chat cannot determine the exact cause. Continue monitoring your pet closely and arrange veterinary advice if the concern persists or worsens.",

  nextSteps: [
    "Monitor appetite, water intake, energy, and symptom frequency.",
    "Record any changes so you can share them with a veterinarian.",
    "Seek veterinary care promptly if symptoms worsen or new warning signs appear.",
  ],

  urgent: false,

  triage: {
    level: triage.level,
    source: "local",
  },

  processingSteps,
});

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

  const followUpCount = conversation.filter(
    (message) => message?.role === "assistant",
  ).length;

  /*
   * ---------------------------------------------------------
   * STEP 1
   * Fetch complete pet profile
   * ---------------------------------------------------------
   */

  const pet = await getPetProfile(petId);

  /*
   * ---------------------------------------------------------
   * STEP 2
   * Fetch previous medical records
   * ---------------------------------------------------------
   */

  const healthRecords = await getHealthRecords(petId);

  /*
   * ---------------------------------------------------------
   * STEP 3
   * Run local safety / triage rules
   *
   * Local rules are checked before the AI.
   * This prevents obvious emergency signals from depending
   * entirely on the external AI model.
   * ---------------------------------------------------------
   */

  const triage = runHealthTriage({
    message: currentSymptoms,
    petProfile: pet,
    healthRecords,
    conversation,
  });

  /*
   * At this point the following user-safe stages are complete.
   *
   * Veterinary knowledge is marked as completed only because
   * the current AI service already has its own general model
   * knowledge. A dedicated veterinary knowledge retrieval layer
   * will be added separately later.
   */

  const processingStepsBeforeAnalysis = buildProcessingSteps({
    petProfile: "completed",
    medicalRecords: "completed",
    healthHistory: "completed",
    safetyCheck: "completed",
    veterinaryKnowledge: "completed",
    analysis: "processing",
  });

  /*
   * ---------------------------------------------------------
   * STEP 4
   * Emergency handling
   *
   * Never depend on Gemini to downgrade an emergency signal
   * detected by local rules.
   * ---------------------------------------------------------
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
        source: "local",
      },

      processingSteps: buildProcessingSteps({
        petProfile: "completed",
        medicalRecords: "completed",
        healthHistory: "completed",
        safetyCheck: "completed",
        veterinaryKnowledge: "completed",
        analysis: "completed",
      }),
    };
  }

  /*
   * ---------------------------------------------------------
   * STEP 5
   * Generate AI health insight
   *
   * The AI receives:
   *
   * - complete pet profile
   * - medical records
   * - current symptoms
   * - previous conversation
   * - local triage information
   * ---------------------------------------------------------
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
     * -------------------------------------------------------
     * AI unavailable
     *
     * The Health Check must still work using local rules.
     * -------------------------------------------------------
     */

    if (
      triage.suggestedFollowUp &&
      followUpCount < 3 &&
      !hasAskedQuestion(
        conversation,
        triage.suggestedFollowUp.suggestedQuestion,
      )
    ) {
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

        processingSteps: buildProcessingSteps({
          petProfile: "completed",
          medicalRecords: "completed",
          healthHistory: "completed",
          safetyCheck: "completed",
          veterinaryKnowledge: "completed",
          analysis: "completed",
        }),
      };
    }

    return buildConversationFallback({
      pet,
      healthRecords,
      currentSymptoms,
      triage,

      processingSteps: buildProcessingSteps({
        petProfile: "completed",
        medicalRecords: "completed",
        healthHistory: "completed",
        safetyCheck: "completed",
        veterinaryKnowledge: "completed",
        analysis: "completed",
      }),
    });
  }

  /*
   * ---------------------------------------------------------
   * STEP 6
   * Safety normalization
   *
   * Never allow the AI response to remove urgency when
   * local rules already identified RED-level signals.
   * ---------------------------------------------------------
   */

  const safeUrgent =
    triage.level === "RED"
      ? true
      : Boolean(aiResponse.urgent);

  /*
   * ---------------------------------------------------------
   * STEP 7
   * Validate AI follow-up question
   * ---------------------------------------------------------
   */

  const question = String(
    aiResponse.question || "",
  ).trim();

  const repeatedQuestion =
    aiResponse.status === "FOLLOW_UP" &&
    (!question ||
      hasAskedQuestion(
        conversation,
        question,
      ));

  /*
   * If the AI repeatedly asks the same question,
   * stop the loop and provide a cautious assessment.
   */

  if (repeatedQuestion) {
    return buildConversationFallback({
      pet,
      healthRecords,
      currentSymptoms,
      triage,

      processingSteps: buildProcessingSteps({
        petProfile: "completed",
        medicalRecords: "completed",
        healthHistory: "completed",
        safetyCheck: "completed",
        veterinaryKnowledge: "completed",
        analysis: "completed",
      }),
    });
  }

  /*
   * ---------------------------------------------------------
   * STEP 8
   * Build final response
   * ---------------------------------------------------------
   */

  const finalStatus =
    aiResponse.status === "FOLLOW_UP"
      ? "FOLLOW_UP"
      : "FINAL";

  return {
    pet,
    healthRecords,
    currentSymptoms,

    status: finalStatus,

    question,

    assessment:
      aiResponse.assessment || "",

    nextSteps:
      Array.isArray(aiResponse.nextSteps)
        ? aiResponse.nextSteps
        : [],

    urgent: safeUrgent,

    triage: {
      level: triage.level,

      medicalSignals:
        triage.medicalSignals,

      source: "local+ai",
    },

    processingSteps: buildProcessingSteps({
      petProfile: "completed",
      medicalRecords: "completed",
      healthHistory: "completed",
      safetyCheck: "completed",
      veterinaryKnowledge: "completed",
      analysis: "completed",
    }),
  };
}