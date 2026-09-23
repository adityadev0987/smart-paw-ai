// Backend/services/healthTriageRules.js

const normalizeText = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value
      .map(normalizeText)
      .join(" ");
  }

  if (typeof value === "object") {
    return Object.values(value)
      .map(normalizeText)
      .join(" ");
  }

  return String(value);
};

const normalizeMessage = (value) =>
  normalizeText(value)
    .toLowerCase()
    .replace(/[?!.:,;]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const containsAny = (text, keywords) => {
  const normalized = normalizeMessage(text);

  return keywords.some((keyword) =>
    normalized.includes(
      normalizeMessage(keyword),
    ),
  );
};

const getConversationText = (
  conversation = [],
) => {
  if (!Array.isArray(conversation)) {
    return "";
  }

  return conversation
    .map((message) =>
      normalizeText(message?.content),
    )
    .join(" ");
};

/*
 * ==========================================================
 * EMERGENCY RULES
 * ==========================================================
 *
 * These are safety/triage signals only.
 * They do NOT diagnose a disease.
 */

const EMERGENCY_RULES = [
  {
    id: "breathing",

    keywords: [
      "difficulty breathing",
      "trouble breathing",
      "cannot breathe",
      "can't breathe",
      "not breathing",
      "breathing problem",
      "breathing difficulty",
      "struggling to breathe",
      "hard to breathe",
    ],

    reason:
      "Breathing difficulty can require urgent veterinary assessment.",
  },

  {
    id: "collapse",

    keywords: [
      "collapsed",
      "collapse",
      "unconscious",
      "unresponsive",
      "passed out",
      "not responding",
    ],

    reason:
      "Collapse or unresponsiveness can require urgent veterinary assessment.",
  },

  {
    id: "seizure",

    keywords: [
      "seizure",
      "seizures",
      "convulsion",
      "convulsions",
      "fitting",
      "fits",
    ],

    reason:
      "Seizure activity can require prompt veterinary assessment.",
  },

  {
    id: "poisoning",

    keywords: [
      "poison",
      "poisoned",
      "poisoning",
      "toxin",
      "toxic",
      "ate poison",
      "ingested poison",
      "chemical ingestion",
      "ate something toxic",
    ],

    reason:
      "Possible toxin exposure can require urgent veterinary guidance.",
  },

  {
    id: "severe_bleeding",

    keywords: [
      "heavy bleeding",
      "severe bleeding",
      "uncontrolled bleeding",
      "bleeding won't stop",
      "bleeding wont stop",
      "blood won't stop",
      "blood wont stop",
    ],

    reason:
      "Uncontrolled bleeding can require urgent veterinary assessment.",
  },

  {
    id: "urinary_emergency",

    keywords: [
      "cannot urinate",
      "can't urinate",
      "unable to urinate",
      "not able to urinate",
      "cannot pee",
      "can't pee",
      "unable to pee",
      "straining to pee",
      "straining to urinate",
      "trying to pee but nothing comes out",
    ],

    reason:
      "Difficulty passing urine can require prompt veterinary assessment.",
  },

  {
    id: "foreign_body",

    keywords: [
      "swallowed object",
      "swallowed a toy",
      "swallowed toy",
      "swallowed string",
      "swallowed bone",
      "ate a toy",
      "ate string",
      "ate a bone",
      "foreign object",
      "foreign body",
    ],

    reason:
      "Possible foreign-object ingestion can require prompt veterinary guidance.",
  },

  {
    id: "severe_trauma",

    keywords: [
      "hit by car",
      "car accident",
      "road accident",
      "major accident",
      "severe injury",
      "serious injury",
      "severe trauma",
      "bad accident",
    ],

    reason:
      "Major trauma can require urgent veterinary assessment.",
  },
];

/*
 * ==========================================================
 * SYMPTOM FOLLOW-UP RULES
 * ==========================================================
 *
 * These rules suggest useful questions.
 *
 * They do NOT automatically mean the pet has a disease.
 */

const FOLLOW_UP_RULES = [
  {
    id: "vomiting",

    keywords: [
      "vomiting",
      "vomited",
      "throwing up",
      "threw up",
      "threw-up",
    ],

    question:
      "How many times has your pet vomited, and when did it start?",
  },

  {
    id: "diarrhea",

    keywords: [
      "diarrhea",
      "diarrhoea",
      "loose stool",
      "loose stools",
      "watery stool",
    ],

    question:
      "When did the diarrhea start, and how frequently is it happening?",
  },

  {
    id: "appetite",

    keywords: [
      "not eating",
      "not eating food",
      "loss of appetite",
      "poor appetite",
      "refusing food",
      "refuses food",
      "won't eat",
      "wont eat",
    ],

    question:
      "When did your pet last eat normally, and are they drinking water normally?",
  },

  {
    id: "lethargy",

    keywords: [
      "lethargic",
      "lethargy",
      "very tired",
      "extremely tired",
      "weak",
      "weakness",
      "low energy",
      "no energy",
    ],

    question:
      "When did the unusual tiredness or weakness start?",
  },

  {
    id: "pain",

    keywords: [
      "pain",
      "painful",
      "hurting",
      "hurt",
      "crying in pain",
      "seems painful",
    ],

    question:
      "Where does your pet seem to be experiencing pain, and when did it start?",
  },

  {
    id: "coughing",

    keywords: [
      "cough",
      "coughing",
      "keeps coughing",
    ],

    question:
      "When did the coughing start, and how often is it happening?",
  },

  {
    id: "itching",

    keywords: [
      "itchy",
      "itching",
      "scratching",
      "scratching a lot",
      "keeps scratching",
    ],

    question:
      "When did the itching start, and have you noticed any skin changes?",
  },
];

/*
 * ==========================================================
 * MEDICAL CONTEXT SIGNALS
 * ==========================================================
 *
 * These are extracted from the actual pet profile.
 *
 * They provide context to the AI.
 * They do not automatically create an emergency.
 */

const getRelevantMedicalSignals = (
  petProfile = {},
) => {
  const signals = [];

  const medical =
    petProfile.medical || {};

  if (
    Array.isArray(medical.allergies) &&
    medical.allergies.length > 0
  ) {
    signals.push({
      type: "known_allergies",
      data: medical.allergies,
    });
  }

  if (
    Array.isArray(medical.conditions) &&
    medical.conditions.length > 0
  ) {
    signals.push({
      type: "existing_conditions",
      data: medical.conditions,
    });
  }

  if (
    Array.isArray(
      medical.previousIllnesses,
    ) &&
    medical.previousIllnesses.length > 0
  ) {
    signals.push({
      type: "previous_illnesses",
      data: medical.previousIllnesses,
    });
  }

  if (
    Array.isArray(medical.medications) &&
    medical.medications.length > 0
  ) {
    signals.push({
      type: "current_medications",
      data: medical.medications,
    });
  }

  if (
    Array.isArray(medical.surgeries) &&
    medical.surgeries.length > 0
  ) {
    signals.push({
      type: "surgical_history",
      data: medical.surgeries,
    });
  }

  if (
    Array.isArray(
      medical.previousHospitalizations,
    ) &&
    medical.previousHospitalizations.length > 0
  ) {
    signals.push({
      type: "previous_hospitalizations",
      data: medical.previousHospitalizations,
    });
  }

  return signals;
};

/*
 * ==========================================================
 * FIND CURRENT SYMPTOMS
 * ==========================================================
 *
 * Important:
 *
 * We primarily inspect the CURRENT USER MESSAGE.
 *
 * This prevents a previous medical record containing
 * "vomiting" from automatically making today's concern
 * a vomiting case.
 */

const getCurrentSymptomSignals = (
  message = "",
) => {
  const text = normalizeMessage(message);

  return FOLLOW_UP_RULES
    .filter((rule) =>
      containsAny(
        text,
        rule.keywords,
      ),
    )
    .map((rule) => ({
      id: rule.id,
      suggestedQuestion:
        rule.question,
    }));
};

/*
 * ==========================================================
 * FIND EMERGENCY SIGNALS
 * ==========================================================
 *
 * Emergency detection is based primarily on the
 * current user message and recent conversation.
 */

const getEmergencySignals = (
  message = "",
  conversation = [],
) => {
  const currentText =
    normalizeMessage(message);

  const recentConversation =
    getConversationText(
      conversation,
    );

  const searchText =
    `${currentText} ${recentConversation}`.trim();

  return EMERGENCY_RULES
    .filter((rule) =>
      containsAny(
        searchText,
        rule.keywords,
      ),
    )
    .map((rule) => ({
      id: rule.id,
      reason: rule.reason,
    }));
};

/*
 * ==========================================================
 * CHECK WHETHER QUESTION WAS ALREADY ASKED
 * ==========================================================
 */

const wasQuestionAlreadyAsked = (
  conversation = [],
  question = "",
) => {
  const target =
    normalizeMessage(question);

  if (!target) {
    return false;
  }

  return conversation.some(
    (message) => {
      if (
        message?.role !==
        "assistant"
      ) {
        return false;
      }

      const content =
        normalizeMessage(
          message.content,
        );

      return (
        content.includes(target) ||
        target.includes(content)
      );
    },
  );
};

/*
 * ==========================================================
 * GET FOLLOW-UP SIGNAL
 * ==========================================================
 *
 * If the question has already been asked,
 * don't suggest it again.
 */

const getFollowUpSignal = (
  message,
  conversation = [],
) => {
  const signals =
    getCurrentSymptomSignals(
      message,
    );

  for (const signal of signals) {
    if (
      !wasQuestionAlreadyAsked(
        conversation,
        signal.suggestedQuestion,
      )
    ) {
      return signal;
    }
  }

  return null;
};

/*
 * ==========================================================
 * TRIAGE
 * ==========================================================
 */

export function runHealthTriage({
  message,
  petProfile = {},
  healthRecords = [],
  conversation = [],
}) {
  const currentMessage =
    normalizeMessage(message);

  const emergencySignals =
    getEmergencySignals(
      currentMessage,
      conversation,
    );

  const medicalSignals =
    getRelevantMedicalSignals(
      petProfile,
    );

  /*
   * Emergency always wins.
   */
  if (
    emergencySignals.length > 0
  ) {
    return {
      level: "RED",

      urgent: true,

      emergency: true,

      emergencySignals,

      medicalSignals,

      suggestedFollowUp: null,

      currentSymptomSignals: [],

      reason:
        "One or more potentially urgent warning signs were detected from the current concern or recent conversation.",
    };
  }

  /*
   * Look for useful context from the
   * CURRENT concern.
   */
  const currentSymptomSignals =
    getCurrentSymptomSignals(
      currentMessage,
    );

  const suggestedFollowUp =
    getFollowUpSignal(
      currentMessage,
      conversation,
    );

  /*
   * If a known symptom is present,
   * use YELLOW as a request for context.
   *
   * This is not a diagnosis.
   */
  if (
    currentSymptomSignals.length > 0
  ) {
    return {
      level: "YELLOW",

      urgent: false,

      emergency: false,

      emergencySignals: [],

      medicalSignals,

      currentSymptomSignals,

      suggestedFollowUp,

      reason:
        "The current concern matches a symptom for which additional context may help assess urgency.",
    };
  }

  /*
   * No predefined warning signal.
   */
  return {
    level: "GREEN",

    urgent: false,

    emergency: false,

    emergencySignals: [],

    medicalSignals,

    currentSymptomSignals: [],

    suggestedFollowUp: null,

    reason:
      "No predefined urgent warning signal was detected from the current concern.",
  };
}

export default runHealthTriage;