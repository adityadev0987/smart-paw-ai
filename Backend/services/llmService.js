import { GoogleGenAI, Type } from "@google/genai";

function getGeminiClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateGeminiResponse(ai, requestConfig) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await ai.models.generateContent(requestConfig);
    } catch (error) {
      const status = error?.status;

      const isRetryable =
        status === 500 ||
        status === 503 ||
        status === 429;

      if (!isRetryable || attempt === maxAttempts) {
        throw error;
      }

      const delay = attempt * 1000;

      console.warn(
        `Gemini request failed with ${status}. Retrying in ${delay}ms...`,
      );

      await sleep(delay);
    }
  }
}

function safeJson(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "{}";
  }
}

function cleanText(value) {
  return String(value || "").trim();
}

function getPetName(pet) {
  return (
    pet?.general?.name ||
    pet?.name ||
    "your pet"
  );
}

function buildHealthHistory(healthRecords) {
  if (!Array.isArray(healthRecords) || healthRecords.length === 0) {
    return "No previous health records are available.";
  }

  return healthRecords
    .map((record) => {
      const date =
        record?.date ||
        record?.createdAt ||
        "Unknown date";

      const title =
        record?.title ||
        "Health record";

      const type =
        record?.type ||
        "General";

      const notes =
        record?.notes
          ? ` - ${record.notes}`
          : "";

      return `- ${date}: ${title} (${type})${notes}`;
    })
    .join("\n");
}

function buildConversationHistory(conversation) {
  if (
    !Array.isArray(conversation) ||
    conversation.length === 0
  ) {
    return "No previous conversation.";
  }

  return conversation
    .map((message) => {
      const speaker =
        message?.role === "user"
          ? "Pet Owner"
          : "Smart Paw AI";

      const content =
        cleanText(message?.content) ||
        "(empty message)";

      return `${speaker}: ${content}`;
    })
    .join("\n");
}

function getPreviousAssistantMessages(conversation) {
  if (
    !Array.isArray(conversation) ||
    conversation.length === 0
  ) {
    return [];
  }

  return conversation
    .filter(
      (message) =>
        message?.role === "assistant" &&
        typeof message?.content === "string",
    )
    .map((message) => message.content.trim())
    .filter(Boolean);
}

function getLatestOwnerMessage(
  conversation,
  symptoms,
) {
  if (
    Array.isArray(conversation) &&
    conversation.length > 0
  ) {
    const latestOwnerMessage =
      [...conversation]
        .reverse()
        .find(
          (message) =>
            message?.role === "user",
        )
        ?.content;

    if (latestOwnerMessage) {
      return latestOwnerMessage;
    }
  }

  return symptoms;
}

function hasFinalAssessment(conversation) {
  return (
    Array.isArray(conversation) &&
    conversation.some(
      (message) =>
        message?.kind === "final-assessment",
    )
  );
}

export async function generateHealthInsight({
  pet,
  healthRecords = [],
  symptoms,
  conversation = [],
  triage = {},
}) {
  const followUpCount = conversation.filter(
    (message) =>
      message?.role === "assistant",
  ).length;

  const finalAssessmentAlreadyGiven =
    hasFinalAssessment(conversation);

  const petName = getPetName(pet);

  const healthHistory =
    buildHealthHistory(healthRecords);

  const conversationHistory =
    buildConversationHistory(conversation);

  const previousAssistantMessages =
    getPreviousAssistantMessages(
      conversation,
    );

  const askedFollowUpQuestions =
    previousAssistantMessages.length > 0
      ? previousAssistantMessages
          .map(
            (message) => `- ${message}`,
          )
          .join("\n")
      : "No previous assistant messages.";

  const latestOwnerMessage =
    getLatestOwnerMessage(
      conversation,
      symptoms,
    );

  const systemInstruction = `
You are Smart Paw AI, a veterinary-informed
pet health guidance assistant.

You are NOT a veterinarian.

Your role is to help a pet owner understand
their pet's health concern in a natural,
calm, caring, conversational way.

You should behave like a knowledgeable pet
health assistant who carefully reviews the
available information before responding.

==================================================
CORE BEHAVIOR
==================================================

Be human-friendly.

Do NOT sound like a robot.

Do NOT use generic phrases repeatedly.

Do NOT produce unnecessarily formal medical
language.

Do NOT overwhelm the owner with information.

Speak naturally and clearly.

Use the pet's actual name when appropriate.

For example:

Instead of:

"The animal is exhibiting gastrointestinal
symptoms."

Prefer:

"It sounds like ${petName} may be having some
stomach-related trouble."

However, never make the response overly casual
when an urgent health concern is present.

Be warm without pretending to be a veterinarian.

==================================================
MEDICAL CONTEXT
==================================================

The PET MEDICAL CONTEXT is the primary source
of known information about this pet.

Use it actively.

The previous HEALTH RECORDS are also part of
the pet's medical history.

Do NOT ask the owner for information that is
already available.

Before asking a question, check:

- Pet profile
- Medical history
- Existing conditions
- Previous illnesses
- Allergies
- Current medications
- Supplements
- Surgeries
- Hospitalizations
- Vaccinations
- Parasite prevention
- Nutrition
- Water intake
- Behavior
- Lifestyle
- Grooming and dental information
- Health monitoring
- Reproductive/family history
- Previous health records
- Conversation history

==================================================
USE HISTORY IN THE ACTUAL ANSWER
==================================================

Do not merely receive the medical history.

Use relevant history when forming the response.

For example, if the pet has a previous history
that is relevant to the current symptom, mention
that connection naturally.

Example:

"I noticed that ${petName}'s records mention a
previous stomach-related issue. Because you're
now describing vomiting again, that history is
worth considering."

Do NOT mention unrelated history just to prove
that you read the records.

Only reference history that actually matters.

Never invent a medical history.

==================================================
FOLLOW-UP QUESTIONS
==================================================

Ask a follow-up question only when the missing
information could materially change:

- The possible explanations
- The urgency
- The recommended next step
- The interpretation of the symptoms

Ask EXACTLY ONE question at a time.

Never ask multiple questions in one message.

Do not ask something already present in the
medical context.

Do not repeat a question that was already asked.

Previously discussed assistant messages:

${askedFollowUpQuestions}

If the owner has already answered a previous
question, use that answer.

Maximum follow-up questions:

3

Current follow-up count:

${followUpCount}

If the follow-up count is 3 or greater:

Return FINAL.

Do not ask another question.

==================================================
WHEN TO ASK A QUESTION
==================================================

Useful missing information may include:

- How long the symptom has been happening
- How often it happens
- Whether it is getting worse
- Appetite
- Water intake
- Energy
- Pain
- Breathing
- Vomiting
- Diarrhea
- Urination
- Bowel movements
- Blood
- Possible toxin exposure
- Possible foreign-object ingestion
- Recent environmental changes

But only ask when the answer can meaningfully
change your assessment.

Do NOT ask questions just to make the conversation
longer.

==================================================
SAME-SESSION CONVERSATION
==================================================

This is an ongoing conversation.

If an initial health assessment has already been
completed and the owner asks another question
about the SAME concern:

Answer that question directly.

Do NOT restart the health check.

Do NOT ask the owner to create a new health check.

Do NOT repeat the entire previous assessment.

Use the existing:

- Pet context
- Medical records
- Previous conversation
- Triage information
- Earlier assessment

Example:

Owner:
"Is this something I should monitor tonight?"

Answer that question directly.

If the answer can be given safely from the
available information, do not ask another
follow-up question.

==================================================
GREEN / YELLOW / RED
==================================================

These are TRIAGE levels.

They are NOT diagnoses.

GREEN:

No predefined urgent warning signal was detected
and available information does not indicate
immediate concern.

YELLOW:

More information may be needed, symptoms may
need closer monitoring, or the pet's history
makes the situation more important to assess.

RED:

A potentially urgent warning sign is present.

Never say:

"GREEN means completely safe."

"YELLOW means nothing serious."

"RED means the pet has disease X."

==================================================
LOCAL TRIAGE
==================================================

A deterministic local triage engine has already
checked the case.

Local triage result:

${safeJson(triage)}

If local triage identifies an emergency:

Do NOT downgrade the urgency.

Do NOT tell the owner that everything is fine.

Recommend prompt veterinary evaluation.

==================================================
HEALTH REASONING
==================================================

Consider the entire case:

Current symptoms
+
Pet medical history
+
Previous health records
+
Allergies
+
Medications
+
Age
+
Breed
+
Weight
+
Lifestyle
+
Nutrition
+
Behavior
+
Conversation
+
Triage

Possible explanations can be discussed.

Use language such as:

"One possibility is..."

"Possible explanations include..."

"There are a few things that can cause this..."

"The available information cannot distinguish
between these causes yet."

Never present a possible explanation as a
confirmed diagnosis.

==================================================
SAFETY
==================================================

You must NEVER:

- Claim to be a veterinarian.
- Provide a definitive diagnosis.
- Prescribe medication.
- Provide medication dosage instructions.
- Recommend prescription medication.
- Recommend supplements as treatment.
- Invent symptoms.
- Invent medical history.
- Claim certainty when information is incomplete.
- Tell the owner that veterinary care is unnecessary
  when warning signs are present.

==================================================
EMERGENCY WARNING SIGNS
==================================================

Pay particular attention to:

- Difficulty breathing
- Collapse
- Unresponsiveness
- Seizures
- Severe or uncontrolled bleeding
- Suspected poisoning
- Suspected toxin exposure
- Suspected foreign-body ingestion
- Severe trauma
- Inability to urinate
- Severe deterioration
- Severe abdominal swelling
- Severe pain
- Repeated or severe vomiting with concerning signs

If these are present, recommend prompt
veterinary evaluation.

==================================================
WATER / FOOD
==================================================

Do not recommend completely withholding water.

Do not prescribe fasting protocols.

Do not prescribe medication.

For vomiting or nausea:

- Do not force food or water.
- If drinking repeatedly triggers vomiting,
  recommend veterinary assessment.
- For severe or repeated vomiting, prioritize
  veterinary assessment.

==================================================
FINAL ASSESSMENT
==================================================

A FINAL response should be:

- Case-specific
- Clear
- Natural
- Human-friendly
- Based on the available information
- Honest about uncertainty

Normally keep the assessment around
3-5 complete sentences.

Explain naturally:

1. What matters right now.
2. What the pattern could indicate.
3. What remains uncertain.
4. How concerning it may be.
5. What the owner should do next.

Do not repeat information unnecessarily.

Next steps should contain 2-5 practical actions.

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

No markdown.

No code fences.

Required structure:

{
  "status": "FOLLOW_UP" | "FINAL",
  "question": "string",
  "assessment": "string",
  "nextSteps": ["string"],
  "urgent": true | false
}

FOLLOW_UP:

{
  "status": "FOLLOW_UP",
  "question": "ONE useful question only",
  "assessment": "",
  "nextSteps": [],
  "urgent": false
}

FINAL:

{
  "status": "FINAL",
  "question": "",
  "assessment": "natural case-specific response",
  "nextSteps": ["action 1", "action 2"],
  "urgent": false
}
`;

  const userPrompt = `
==================================================
PET MEDICAL CONTEXT
==================================================

${safeJson(pet)}

==================================================
PREVIOUS HEALTH RECORDS
==================================================

${healthHistory}

==================================================
CURRENT OWNER CONCERN
==================================================

${symptoms}

==================================================
LATEST OWNER MESSAGE
==================================================

${latestOwnerMessage}

==================================================
CONVERSATION HISTORY
==================================================

${conversationHistory}

==================================================
FOLLOW-UP COUNT
==================================================

${followUpCount}

==================================================
INITIAL ASSESSMENT ALREADY GIVEN
==================================================

${finalAssessmentAlreadyGiven}

==================================================
LOCAL TRIAGE RESULT
==================================================

${safeJson(triage)}

==================================================
TASK
==================================================

Analyze the owner's current concern using the
COMPLETE pet medical context.

Do not focus only on the latest symptom.

Review the pet's history before deciding whether
additional information is needed.

If relevant medical history changes how the
current symptom should be understood, use that
history in the response.

If an important detail is missing and fewer than
3 follow-up questions have been asked, return
FOLLOW_UP with exactly ONE useful question.

If the initial assessment has already been
completed and the owner is asking a follow-up
question about the same concern, answer the
question directly.

Do not restart the health check.

Do not unnecessarily ask another question when
the available context is enough.

If local triage indicates an emergency, preserve
that urgency.

Return FINAL when enough information is available.
`;

  try {
    const ai = getGeminiClient();

    const response =
      await generateGeminiResponse(ai, {
        model: "gemini-3.1-flash-lite",

        contents: userPrompt,

        config: {
          systemInstruction,

          temperature: 0.35,

          maxOutputTokens: 1800,

          thinkingConfig: {
            thinkingBudget: 256,
          },

          responseMimeType:
            "application/json",

          responseSchema: {
            type: Type.OBJECT,

            properties: {
              status: {
                type: Type.STRING,

                enum: [
                  "FOLLOW_UP",
                  "FINAL",
                ],
              },

              question: {
                type: Type.STRING,
              },

              assessment: {
                type: Type.STRING,
              },

              nextSteps: {
                type: Type.ARRAY,

                items: {
                  type: Type.STRING,
                },
              },

              urgent: {
                type: Type.BOOLEAN,
              },
            },

            required: [
              "status",
              "question",
              "assessment",
              "nextSteps",
              "urgent",
            ],
          },
        },
      });

    const content =
      response.text?.trim() || "";

    if (!content) {
      throw new Error(
        "Gemini returned an empty response.",
      );
    }

    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch {
      console.error(
        "Invalid Gemini JSON:",
        content,
      );

      throw new Error(
        "Invalid JSON returned by Gemini.",
      );
    }

    /*
     * Never allow a fourth follow-up question.
     */
    if (
      followUpCount >= 3 &&
      parsed.status === "FOLLOW_UP"
    ) {
      return {
        status: "FINAL",

        question: "",

        assessment:
          "I have enough information to give you a cautious view, although chat cannot confirm the exact cause. Based on what you've shared and your pet's history, the main thing now is to monitor how the symptoms change rather than assuming a definite diagnosis.",

        nextSteps: [
          "Monitor your pet's symptoms and overall behavior.",
          "Keep track of appetite, water intake, energy, and symptom frequency.",
          "Contact a veterinarian if the symptoms persist, worsen, or new warning signs appear.",
        ],

        urgent:
          triage.level === "RED"
            ? true
            : Boolean(parsed.urgent),
      };
    }

    /*
     * FOLLOW-UP response
     */
    if (
      parsed.status === "FOLLOW_UP"
    ) {
      const question =
        cleanText(parsed.question);

      if (!question) {
        throw new Error(
          "AI returned an empty follow-up question.",
        );
      }

      return {
        status: "FOLLOW_UP",

        question,

        assessment: "",

        nextSteps: [],

        urgent:
          triage.level === "RED"
            ? true
            : Boolean(parsed.urgent),
      };
    }

    /*
     * FINAL response
     */
    if (
      parsed.status === "FINAL"
    ) {
      const assessment =
        cleanText(
          parsed.assessment,
        );

      const nextSteps =
        Array.isArray(
          parsed.nextSteps,
        )
          ? parsed.nextSteps
              .filter(
                (step) =>
                  typeof step ===
                    "string" &&
                  step.trim(),
              )
              .map(
                (step) =>
                  step.trim(),
              )
              .slice(0, 5)
          : [];

      return {
        status: "FINAL",

        question: "",

        assessment:
          assessment ||
          "I have reviewed the information available, but I cannot determine the exact cause from chat alone.",

        nextSteps:
          nextSteps.length > 0
            ? nextSteps
            : [
                "Monitor your pet closely.",
                "Watch for worsening or new symptoms.",
                "Contact a veterinarian if the concern persists or worsens.",
              ],

        urgent:
          triage.level === "RED"
            ? true
            : Boolean(parsed.urgent),
      };
    }

    throw new Error(
      "Invalid response status from Gemini.",
    );
  } catch (error) {
    console.error(
      "Gemini health insight error:",
      error,
    );

    throw error;
  }
}