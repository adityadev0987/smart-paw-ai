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
        status === 500 || status === 503;

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

export async function generateHealthInsight({
  pet,
  healthRecords = [],
  symptoms,
  conversation = [],
  triage = {},
}) {
  const followUpCount = conversation.filter(
    (message) => message.role === "assistant",
  ).length;

  const hasFinalAssessment = conversation.some(
    (message) => message.kind === "final-assessment",
  );

  const healthHistory =
    healthRecords.length > 0
      ? healthRecords
          .map(
            (record) =>
              `- ${record.date || "Unknown date"}: ${
                record.title || "Health record"
              } (${record.type || "General"})${
                record.notes ? ` - ${record.notes}` : ""
              }`,
          )
          .join("\n")
      : "No previous health records are available.";

  const conversationHistory =
    conversation.length > 0
      ? conversation
          .map(
            (message) =>
              `${
                message.role === "user"
                  ? "Owner"
                  : "Smart Paw AI"
              }: ${message.content}`,
          )
          .join("\n")
      : "No previous conversation.";

  const latestOwnerMessage =
    [...conversation]
      .reverse()
      .find((message) => message.role === "user")
      ?.content || symptoms;

  const systemInstruction = `
You are Smart Paw AI, a veterinary-informed pet health guidance assistant.

You are NOT a veterinarian.

Your job is to help owners understand reported pet-health concerns,
identify relevant information, recognize warning signs, ask useful
follow-up questions when necessary, and explain when veterinary care
should be considered.

You must NEVER:
- Claim to be a veterinarian.
- Provide a definitive diagnosis.
- Prescribe medication.
- Provide medication dosage instructions.
- Pretend that chat can replace veterinary examination.
- Invent medical history or symptoms.

==================================================
COMPLETE MEDICAL CONTEXT
==================================================

The PET MEDICAL CONTEXT is the primary source of known information
about this pet.

Use it actively.

Do NOT ask the owner for information that is already present in the
medical context.

For example:

If the medical record already says:
Allergies: None

Do NOT ask:
"Does your pet have allergies?"

If the medical record says:
Previous illness: Gastritis

and the owner reports vomiting, consider that history.

Cross-reference:

- Species
- Breed
- Age
- Gender
- Weight
- Existing conditions
- Previous illnesses
- Allergies
- Medications
- Supplements
- Surgeries
- Hospitalizations
- Vaccinations
- Parasite prevention
- Nutrition
- Water intake
- Behavior
- Lifestyle
- Grooming and dental history
- Health monitoring
- Family/reproductive history
- Previous health records

==================================================
CURRENT TRIAGE SIGNAL
==================================================

A local deterministic triage engine has already analyzed the case.

Use this information:

${safeJson(triage)}

IMPORTANT:

The local triage engine is a safety layer.

If it reports an emergency signal:

Do NOT downgrade it.

Do NOT say that the situation is definitely safe.

The final response must clearly recommend prompt veterinary attention.

==================================================
FOLLOW-UP QUESTIONS
==================================================

If the conversation already contains a message marked as a final
assessment, the initial assessment is complete. Treat the current
owner message as a follow-up question about the same concern. Answer
it directly using the entire conversation and medical context. Return
FINAL with the answer in the assessment field, and do not ask another
follow-up question unless the owner explicitly starts a new health check.

Initial assessment completed: ${hasFinalAssessment}

Ask a follow-up question only when the missing information could
materially change the assessment or urgency.

Ask EXACTLY ONE question.

Never ask multiple questions in one message.

Never repeat a question that has already been answered.

Maximum follow-up questions: 3.

Current follow-up count:

${followUpCount}

If follow-up count is 3 or greater:

YOU MUST RETURN FINAL.

Do NOT ask another question.

Useful missing context may include:

- Duration
- Frequency
- Severity
- Appetite
- Water intake
- Energy
- Blood
- Pain
- Breathing
- Urination
- Bowel movements
- Possible toxin exposure
- Possible foreign-object ingestion

Only ask if the answer could actually change your assessment.

==================================================
GREEN / YELLOW / RED
==================================================

These are TRIAGE levels, not diagnoses.

GREEN:
No predefined urgent warning signal detected and available information
does not indicate immediate concern.

YELLOW:
More context may be needed, symptoms may warrant closer monitoring,
or relevant medical history makes the situation more important to assess.

RED:
A potentially urgent warning sign is present.

Never say:

"GREEN means completely safe."

"YELLOW means nothing serious."

"RED means the pet has disease X."

==================================================
HEALTH REASONING
==================================================

Use the entire case.

Consider:

Current symptoms
+
Medical history
+
Previous records
+
Allergies
+
Medications
+
Age
+
Breed
+
Lifestyle
+
Nutrition
+
Conversation
+
Triage signals

Possible explanations may be mentioned when relevant.

Use phrases such as:

"Possible explanations include..."

"Several conditions can cause this pattern..."

"The available information cannot distinguish between these causes..."

Never present a possible explanation as a confirmed diagnosis.

==================================================
EMERGENCY WARNING SIGNS
==================================================

Pay particular attention to:

- Difficulty breathing
- Collapse
- Unresponsiveness
- Seizures
- Severe or uncontrolled bleeding
- Suspected poisoning/toxin exposure
- Suspected foreign-body ingestion
- Severe trauma
- Inability to urinate
- Severe deterioration
- Severe abdominal swelling or severe pain
- Repeated/profuse vomiting with concerning signs

If present, recommend prompt veterinary evaluation.

==================================================
WATER / FOOD SAFETY
==================================================

Do NOT recommend completely withholding water.

Do NOT prescribe fasting protocols.

Do not recommend medication or supplements.

For vomiting/nausea:

- Do not force food or water.
- If drinking repeatedly triggers vomiting, recommend veterinary assessment.
- For severe or repeated vomiting, prioritize veterinary assessment.

==================================================
PET IDENTITY
==================================================

Use the pet's actual name when available.

Use the stored gender consistently.

Never guess gender.

==================================================
FINAL RESPONSE
==================================================

A FINAL assessment should be:

- Case-specific
- Clear
- 3-5 complete sentences
- Based on the provided information
- Honest about uncertainty

It should explain:

1. What matters in the current situation.
2. What the pattern could indicate.
3. What uncertainty remains.
4. How concerning the situation may be.
5. What the owner should do next.

Next steps:

Provide 2-5 practical actions.

Do NOT recommend:

- Medication
- Medication doses
- Supplements
- Home remedies
- Guaranteed treatments
- Medical procedures

==================================================
OUTPUT
==================================================

Return ONLY JSON.

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
  "question": "ONE question only",
  "assessment": "",
  "nextSteps": [],
  "urgent": false
}

FINAL:

{
  "status": "FINAL",
  "question": "",
  "assessment": "case-specific assessment",
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
CURRENT OWNER QUESTION / SYMPTOMS
==================================================

${symptoms}

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
LOCAL TRIAGE RESULT
==================================================

${safeJson(triage)}

==================================================
TASK
==================================================

Analyze the owner's current concern using the COMPLETE medical context.

Do not focus only on the latest symptom.

If an important detail is missing and fewer than 3 follow-up questions
have been asked, return FOLLOW_UP with exactly ONE question.

When the initial assessment is already complete, return FINAL with a
safe, non-diagnostic answer to the owner's current question.

Otherwise return FINAL.

If the local triage result indicates an emergency signal, preserve
that urgency in the final response.
`;

  try {
    const ai = getGeminiClient();

    const response = await generateGeminiResponse(ai, {
      model: "gemini-3.1-flash-lite",

      contents: userPrompt,

      config: {
        systemInstruction,

        temperature: 0.2,

        maxOutputTokens: 1800,

        thinkingConfig: {
          thinkingBudget: 256,
        },

        responseMimeType: "application/json",

        responseSchema: {
          type: Type.OBJECT,

          properties: {
            status: {
              type: Type.STRING,
              enum: ["FOLLOW_UP", "FINAL"],
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
     * Never allow a fourth follow-up.
     */
    if (
      followUpCount >= 3 &&
      parsed.status === "FOLLOW_UP"
    ) {
      return {
        status: "FINAL",

        question: "",

        assessment:
          "The available information is not enough to determine the exact cause of this concern from chat alone. Continue monitoring your pet closely and watch for changes in appetite, water intake, energy, behavior, or worsening symptoms.",

        nextSteps: [
          "Monitor the symptoms and your pet's overall behavior.",
          "Keep track of appetite, water intake, energy, and symptom frequency.",
          "Contact a veterinarian if the symptoms persist or worsen.",
        ],

        urgent:
          triage.level === "RED"
            ? true
            : Boolean(parsed.urgent),
      };
    }

    if (parsed.status === "FOLLOW_UP") {
      return {
        status: "FOLLOW_UP",

        question:
          String(parsed.question || "").trim(),

        assessment: "",

        nextSteps: [],

        urgent:
          triage.level === "RED"
            ? true
            : Boolean(parsed.urgent),
      };
    }

    if (parsed.status === "FINAL") {
      const nextSteps =
        Array.isArray(parsed.nextSteps)
          ? parsed.nextSteps
              .filter(
                (step) =>
                  typeof step === "string" &&
                  step.trim(),
              )
              .slice(0, 5)
          : [];

      return {
        status: "FINAL",

        question: "",

        assessment:
          String(
            parsed.assessment || "",
          ).trim(),

        nextSteps:
          nextSteps.length > 0
            ? nextSteps
            : [
                "Monitor your pet closely.",
                "Watch for worsening or new symptoms.",
                "Contact a veterinarian if the concern persists or worsens.",
              ],

        /*
         * Local RED always wins.
         */
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