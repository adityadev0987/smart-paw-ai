// Backend/services/healthTriageRules.js

const normalizeText = (value) => {
  if (value === null || value === undefined) return "";

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

const buildSearchText = ({
  message = "",
  petProfile = {},
  healthRecords = [],
  conversation = [],
}) => {
  return [
    message,
    normalizeText(petProfile),
    normalizeText(healthRecords),
    normalizeText(conversation),
  ]
    .join(" ")
    .toLowerCase();
};

const containsAny = (text, keywords) => {
  return keywords.some((keyword) => text.includes(keyword));
};

/*
 * These are TRIAGE signals only.
 * They do NOT diagnose diseases.
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
    ],
    reason:
      "Major trauma can require urgent veterinary assessment.",
  },
];

/*
 * Symptoms where more context is usually useful before
 * giving a lower-risk assessment.
 */

const FOLLOW_UP_RULES = [
  {
    id: "vomiting",
    keywords: [
      "vomiting",
      "vomited",
      "throwing up",
      "threw up",
    ],
    questions: [
      "How many times has your pet vomited, and when did it start?",
    ],
  },

  {
    id: "diarrhea",
    keywords: [
      "diarrhea",
      "diarrhoea",
      "loose stool",
      "loose stools",
    ],
    questions: [
      "When did the diarrhea start, and how frequently is it happening?",
    ],
  },

  {
    id: "appetite",
    keywords: [
      "not eating",
      "not eating food",
      "loss of appetite",
      "poor appetite",
      "refusing food",
    ],
    questions: [
      "When did your pet last eat normally, and are they drinking water normally?",
    ],
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
    ],
    questions: [
      "When did the unusual tiredness or weakness start?",
    ],
  },

  {
    id: "pain",
    keywords: [
      "pain",
      "painful",
      "hurting",
      "hurt",
      "crying in pain",
    ],
    questions: [
      "Where does your pet seem to be experiencing pain, and when did it start?",
    ],
  },

  {
    id: "coughing",
    keywords: [
      "cough",
      "coughing",
    ],
    questions: [
      "When did the coughing start, and how often is it happening?",
    ],
  },

  {
    id: "itching",
    keywords: [
      "itchy",
      "itching",
      "scratching",
      "scratching a lot",
    ],
    questions: [
      "When did the itching start, and have you noticed any skin changes?",
    ],
  },
];

const getEmergencySignals = (text) => {
  return EMERGENCY_RULES
    .filter((rule) => containsAny(text, rule.keywords))
    .map((rule) => ({
      id: rule.id,
      reason: rule.reason,
    }));
};

const getFollowUpSignal = (text) => {
  for (const rule of FOLLOW_UP_RULES) {
    if (containsAny(text, rule.keywords)) {
      return {
        id: rule.id,
        suggestedQuestion: rule.questions[0],
      };
    }
  }

  return null;
};

const getRelevantMedicalSignals = (petProfile = {}) => {
  const signals = [];

  const medical = petProfile.medical || {};

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
    Array.isArray(medical.previousIllnesses) &&
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

  return signals;
};

export function runHealthTriage({
  message,
  petProfile,
  healthRecords,
  conversation,
}) {
  const text = buildSearchText({
    message,
    petProfile,
    healthRecords,
    conversation,
  });

  const emergencySignals = getEmergencySignals(text);

  const followUpSignal =
    getFollowUpSignal(text);

  const medicalSignals =
    getRelevantMedicalSignals(petProfile);

  /*
   * Emergency signals always take priority.
   */
  if (emergencySignals.length > 0) {
    return {
      level: "RED",
      urgent: true,
      emergency: true,
      emergencySignals,
      medicalSignals,
      suggestedFollowUp: null,
      reason:
        "One or more potentially urgent warning signs were detected.",
    };
  }

  /*
   * If a symptom needs context, return YELLOW.
   * The AI can still decide whether another question
   * is actually necessary after reviewing the complete context.
   */
  if (followUpSignal) {
    return {
      level: "YELLOW",
      urgent: false,
      emergency: false,
      emergencySignals: [],
      medicalSignals,
      suggestedFollowUp: followUpSignal,
      reason:
        "Additional symptom context may be needed before assessing urgency.",
    };
  }

  /*
   * No deterministic warning signal detected.
   */
  return {
    level: "GREEN",
    urgent: false,
    emergency: false,
    emergencySignals: [],
    medicalSignals,
    suggestedFollowUp: null,
    reason:
      "No predefined urgent warning signal was detected from the available information.",
  };
}

export default runHealthTriage;