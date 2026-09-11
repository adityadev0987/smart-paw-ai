import { GoogleGenAI, Type } from "@google/genai";

function getGeminiClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}

/*
 * Small delay helper used for temporary Gemini retries.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
 * Retry only temporary server errors.
 *
 * 429 is NOT retried because it can mean the project's
 * quota/rate limit has been exhausted.
 */
async function generateGeminiResponse(ai, requestConfig) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await ai.models.generateContent(requestConfig);
    } catch (error) {
      const status = error?.status;

      const isRetryable = status === 500 || status === 503;

      if (!isRetryable || attempt === maxAttempts) {
        throw error;
      }

      const delay = attempt * 1000;

      console.warn(
        `Gemini request failed with ${status}. ` +
          `Retrying in ${delay}ms... ` +
          `(attempt ${attempt}/${maxAttempts})`,
      );

      await sleep(delay);
    }
  }
}

export async function generateHealthInsight({
  pet,
  healthRecords,
  symptoms,
  conversation = [],
}) {
  const healthHistory =
    healthRecords.length > 0
      ? healthRecords
          .map((record) => {
            return `- ${record.date}: ${record.title} (${record.type})${
              record.notes ? ` - ${record.notes}` : ""
            }`;
          })
          .join("\n")
      : "No previous health records are available.";

  const conversationHistory =
    conversation.length > 0
      ? conversation
          .map((message) => {
            return `${
              message.role === "user" ? "Owner" : "Smart Paw AI"
            }: ${message.content}`;
          })
          .join("\n")
      : "No previous conversation.";

  const followUpCount = conversation.filter(
    (message) => message.role === "assistant",
  ).length;

  const systemInstruction = `
You are Smart Paw AI.

You are a veterinary-informed pet health guidance assistant.

Your job is to help a pet owner understand their pet's reported health
problem, identify information that matters, explain reasonable possible
causes, recognize concerning warning signs, provide practical monitoring
guidance, and explain when veterinary care should be sought.

You are NOT a veterinarian.

You must never claim to be a veterinarian, make a definitive diagnosis,
prescribe medication, recommend medication doses, or replace professional
veterinary care.

However, you MUST provide substantive and useful health guidance.

Do not give generic answers unless they are accompanied by specific
guidance relevant to the actual case.

==================================================
CASE ANALYSIS
==================================================

Use ALL available information:

- Pet profile
- Pet age
- Pet breed
- Pet gender
- Previous health records
- Current symptoms
- Entire conversation
- Latest owner response

The conversation is extremely important.

Do not analyze only the original symptom.

==================================================
DO NOT INVENT INFORMATION
==================================================

Never invent:

- Symptoms
- Medical history
- Diagnoses
- Tests
- Medications
- Duration
- Severity
- Veterinary findings

Never assume an unreported symptom is absent.

==================================================
FOLLOW-UP QUESTIONS
==================================================

Ask a follow-up question only when missing information could meaningfully
change the health guidance or urgency.

Ask exactly ONE question.

Never ask multiple questions together.

Never repeat an already answered question.

Prioritize clinically useful information such as:

- How long the symptom has been present
- Frequency
- Severity
- Whether water is being kept down
- Appetite
- Energy level
- Blood
- Pain
- Breathing problems
- Collapse
- Possible toxin exposure
- Possible foreign-object ingestion

Do not ask questions merely to continue the conversation.

Maximum follow-up questions: 3.

Current follow-up count:

${followUpCount}

If the count is 3 or greater:

YOU MUST RETURN FINAL.

Do not ask another question.

==================================================
HEALTH REASONING
==================================================

When producing a FINAL assessment:

First identify the important reported findings.

Then interpret the pattern.

Then explain reasonable possible categories of causes.

Possible categories may include:

- Digestive upset
- Dietary causes
- Stress
- Infection
- Parasites
- Pain
- Medication or toxin exposure
- Foreign-body concerns
- Chronic conditions
- Age-related factors
- Breed-related considerations

Only mention causes that are relevant to the actual case.

Never present a possible cause as a confirmed diagnosis.

Use wording such as:

"Possible explanations include..."
"Several conditions can cause this pattern..."
"The available information cannot distinguish between these causes..."

==================================================
TRIAGE
==================================================

Consider the combination of symptoms.

Potential warning signs include:

- Repeated or persistent vomiting
- Inability to keep water down
- Blood in vomit
- Severe weakness
- Collapse
- Difficulty breathing
- Severe pain
- Marked abdominal swelling
- Seizures
- Suspected toxin exposure
- Suspected foreign-body ingestion
- Rapid deterioration

If such warning signs are reported, clearly recommend prompt or urgent
veterinary evaluation.

Do not say:

"Definitely safe."
"Definitely not an emergency."
"Nothing to worry about."

==================================================
WATER AND FOOD SAFETY
==================================================

Do NOT recommend blanket fasting or withholding water.

Do NOT tell the owner to completely withhold water.

If vomiting or nausea is present:

- Do not force food or water.
- If drinking repeatedly triggers vomiting, recommend prompt veterinary
  evaluation because dehydration can become a concern.
- For severe or repeated vomiting, prioritize veterinary assessment.

==================================================
PET IDENTITY
==================================================

Use the pet's provided name.

Use the pet's provided gender consistently.

Do not change or guess the pet's gender.

If gender is missing, use neutral wording.

==================================================
FINAL ASSESSMENT
==================================================

A FINAL assessment should normally contain 3-5 complete sentences.

It must:

1. Summarize the important reported findings.
2. Explain what the pattern could indicate.
3. Explain uncertainty.
4. Explain how concerning the situation may be.
5. Give a clear reason for the recommended next action.

Do not simply repeat the original symptom.

Generate a case-specific assessment.

==================================================
NEXT STEPS
==================================================

Provide 2-5 practical next steps.

They should be specific to the case.

Do NOT recommend:

- Medication
- Medication dosage
- Supplements
- Home remedies
- Fasting protocols
- Guaranteed treatment
- Medical procedures for the owner

==================================================
PET PROFILE
==================================================

Use breed and age when clinically relevant.

Do not mention breed or age simply to make the response sound
personalized.

==================================================
HEALTH HISTORY
==================================================

Use previous health records when relevant.

If a previous record relates to the current concern, mention it.

Do not force unrelated records into the answer.

==================================================
OUTPUT
==================================================

Return ONLY the required JSON object.

No markdown.

No code fences.

No additional text.

Required structure:

{
  "status": "FOLLOW_UP" | "FINAL",
  "question": "string",
  "assessment": "string",
  "nextSteps": ["string"],
  "urgent": true | false
}

FOLLOW_UP:

- status = FOLLOW_UP
- question = exactly ONE useful question
- assessment = ""
- nextSteps = []
- urgent = true only when appropriate

FINAL:

- status = FINAL
- question = ""
- assessment = meaningful and case-specific
- nextSteps = 2-5 useful actions
- urgent = appropriate urgency judgment

The owner should receive meaningful guidance, not a generic disclaimer.
`;

  const userPrompt = `
PET PROFILE

Name: ${pet.name}
Breed: ${pet.breed}
Age: ${pet.age}
Gender: ${pet.gender}

PREVIOUS HEALTH RECORDS

${healthHistory}

CURRENT SYMPTOMS

${symptoms}

CONVERSATION HISTORY

${conversationHistory}

FOLLOW-UP QUESTIONS ALREADY ASKED

${followUpCount}

Analyze the complete case.

If fewer than 3 follow-up questions have been asked and one important
missing detail could materially change the guidance:

Return FOLLOW_UP with exactly one short question.

Otherwise:

Return FINAL.

For FINAL:

- Use the entire conversation.
- Use the latest owner response.
- Do not focus only on the original symptom.
- Explain the important symptom pattern.
- Explain reasonable possible causes where useful.
- Explain uncertainty.
- Explain how concerning the pattern may be.
- Give practical next steps.
- Explain when veterinary evaluation is appropriate.
- Consider urgent warning signs.
- Do not invent information.
`;

  try {
    const ai = getGeminiClient();

    const response = await generateGeminiResponse(ai, {
      // Current Smart Paw AI model
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

    const content = response.text?.trim() || "";

    console.log("AI model: Gemini 3.1 Flash-Lite");
    console.log("AI response content length:", content.length);
    console.log("Gemini response:", JSON.stringify(response, null, 2));

    if (!content) {
      console.error("Gemini returned empty content.");

      throw new Error("AI returned an empty response.");
    }

    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch (error) {
      console.error("Failed to parse Gemini response:", content);
      console.error("AI parsing error:", error);

      throw new Error("Invalid JSON returned by Gemini.");
    }

    /*
     * Never allow a fourth follow-up question.
     */
    if (followUpCount >= 3 && parsed.status === "FOLLOW_UP") {
      return {
        status: "FINAL",

        question: "",

        assessment: `${pet.name}'s symptoms deserve continued attention. Several different conditions can produce similar symptoms, and the available information is not enough to determine the underlying cause from chat alone. Continue monitoring the reported symptoms and watch closely for worsening behavior, changes in appetite or water intake, increasing weakness, or other warning signs.`,

        nextSteps: [
          "Monitor your pet's symptoms and overall behavior.",

          "Keep track of appetite, water intake, energy, and symptom frequency.",

          "Contact a qualified veterinarian if the symptoms persist or worsen.",
        ],

        urgent: Boolean(parsed.urgent),
      };
    }

    /*
     * FOLLOW-UP response
     */
    if (parsed.status === "FOLLOW_UP") {
      const question = String(parsed.question || "").trim();

      if (!question) {
        throw new Error("AI returned FOLLOW_UP without a question.");
      }

      return {
        status: "FOLLOW_UP",

        question,

        assessment: "",

        nextSteps: [],

        urgent: Boolean(parsed.urgent),
      };
    }

    /*
     * FINAL response
     */
    if (parsed.status === "FINAL") {
      const assessment = String(parsed.assessment || "").trim();

      const nextSteps = Array.isArray(parsed.nextSteps)
        ? parsed.nextSteps
            .filter(
              (step) => typeof step === "string" && step.trim().length > 0,
            )
            .slice(0, 5)
        : [];

      const invalidAssessmentPatterns = [
        /^user safety\s*:/i,
        /^safety\s*:/i,
        /^status\s*:/i,
        /^safe$/i,
        /^normal$/i,
        /^no issue$/i,
        /^no issues$/i,
      ];

      const invalid =
        !assessment ||
        assessment.length < 150 ||
        invalidAssessmentPatterns.some((pattern) =>
          pattern.test(assessment),
        );

      if (!invalid) {
        return {
          status: "FINAL",

          question: "",

          assessment,

          nextSteps:
            nextSteps.length > 0
              ? nextSteps
              : [
                  "Monitor your pet's symptoms and behavior.",

                  "Watch for new or worsening symptoms.",

                  "Contact a qualified veterinarian if symptoms persist or worsen.",
                ],

          urgent: Boolean(parsed.urgent),
        };
      }

      /*
       * Safe fallback if Gemini returns an unusable
       * final assessment.
       */
      return {
        status: "FINAL",

        question: "",

        assessment: `${pet.name}'s current health concern is based on the symptoms and observations you reported during this health check. Several different conditions can produce similar symptoms, so the available information is not enough to determine the exact underlying cause from chat alone. The most important next step is to monitor the symptoms and watch for changes in appetite, water intake, energy, behavior, or any new warning signs. Veterinary evaluation is appropriate if the problem persists, worsens, or becomes concerning.`,

        nextSteps: [
          "Monitor the reported symptoms and your pet's overall behavior.",

          "Keep track of appetite, water intake, energy, and symptom frequency.",

          "Contact a qualified veterinarian if symptoms persist or worsen.",
        ],

        urgent: Boolean(parsed.urgent),
      };
    }

    throw new Error("AI returned an invalid response status.");
  } catch (error) {
    console.error("Gemini health insight error:", error);

    throw new Error("Failed to generate health insight.");
  }
}