import OpenAI from "openai";

export async function generateHealthInsight({
  pet,
  healthRecords,
  symptoms,
  conversation = [],
}) {
  const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  });

  const healthHistory =
    healthRecords.length > 0
      ? healthRecords
          .map(
            (record) =>
              `- ${record.date}: ${record.title} (${record.type})${
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
              `${message.role === "user" ? "Owner" : "Smart Paw AI"}: ${
                message.content
              }`,
          )
          .join("\n")
      : "No previous conversation.";

  const followUpCount = conversation.filter(
    (message) => message.role === "assistant",
  ).length;

  const response = await openai.chat.completions.create({
    model: "openai/gpt-oss-20b:free",

    temperature: 0.2,

    /*
     * Keep enough room for the final answer.
     */
    max_tokens: 900,

    /*
     * Let the model reason internally, but don't return
     * reasoning tokens as part of the visible response.
     *
     * This also reduces the chance that reasoning consumes
     * the complete output budget.
     */
    reasoning: {
      effort: "low",
      exclude: true,
    },

    response_format: {
      type: "json_schema",
      json_schema: {
        name: "smart_paw_health_check",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,

          properties: {
            status: {
              type: "string",
              enum: ["FOLLOW_UP", "FINAL"],
            },

            question: {
              type: ["string", "null"],
            },

            assessment: {
              type: ["string", "null"],
            },

            nextSteps: {
              type: "array",
              items: {
                type: "string",
              },
            },

            urgent: {
              type: "boolean",
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
    },

    messages: [
      {
        role: "system",
        content: `
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

Do not give generic answers such as:

"Monitor your pet."
"See a veterinarian if it gets worse."

unless those statements are accompanied by specific guidance relevant
to the actual case.

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

Example:

Original symptom:
"My dog has been vomiting twice today."

Later information:
"Not eating."
"Drinking water."
"Vomiting since yesterday."
"Looks lethargic."

The final assessment MUST consider the complete pattern.

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

If the owner did not mention diarrhea, do not say:
"There is no diarrhea."

==================================================
FOLLOW-UP QUESTIONS
==================================================

Ask a follow-up question only when the missing information could
meaningfully change the health guidance or urgency.

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

Repeated vomiting together with reduced appetite and lethargy is more
concerning than a single isolated episode.

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

BAD:

"Rocky is currently experiencing My dog has been vomiting twice today."

GOOD STYLE:

"Rocky has been vomiting since yesterday and you have also reported
reduced appetite and lower energy, while he is still drinking water.
That combination can occur with several gastrointestinal or other
underlying problems, and the available information is not enough to
determine the specific cause from chat alone. Because the vomiting has
continued and is accompanied by changes in appetite and energy, this
deserves closer monitoring and veterinary evaluation if it continues
or worsens."

Do NOT copy this example exactly.

Generate a case-specific assessment.

==================================================
NEXT STEPS
==================================================

Provide 2-5 practical next steps.

They should be specific to the case.

Examples:

- Monitor vomiting frequency.
- Monitor whether water can be kept down.
- Monitor appetite and energy.
- Record any blood or unusual material.
- Watch for worsening lethargy.
- Contact a veterinarian if symptoms persist.
- Seek prompt veterinary care if serious warning signs appear.

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
  "question": "string or null",
  "assessment": "string or null",
  "nextSteps": ["string"],
  "urgent": true | false
}

FOLLOW_UP:

- status = FOLLOW_UP
- question = exactly ONE useful question
- assessment = null
- nextSteps = []
- urgent = true only when appropriate

FINAL:

- status = FINAL
- question = null
- assessment = meaningful and case-specific
- nextSteps = 2-5 useful actions
- urgent = appropriate urgency judgment

The owner should receive meaningful guidance, not a generic disclaimer.
`,
      },

      {
        role: "user",
        content: `
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
`,
      },
    ],
  });

  const message = response.choices?.[0]?.message;

  const content = message?.content?.trim() || "";

  console.log(
    "AI model:",
    response.model,
  );

  console.log(
    "AI finish reason:",
    response.choices?.[0]?.finish_reason,
  );

  console.log(
    "AI response content length:",
    content.length,
  );

  if (!content) {
    console.error(
      "AI returned empty content.",
      JSON.stringify(message, null, 2),
    );

    throw new Error(
      "AI returned an empty response.",
    );
  }

  try {
    const parsed = JSON.parse(content);

    /*
     * Never allow a fourth follow-up question.
     */
    if (
      followUpCount >= 3 &&
      parsed.status === "FOLLOW_UP"
    ) {
      return {
        status: "FINAL",
        question: null,
        assessment: `Based on the information shared so far, ${pet.name}'s symptoms deserve continued attention. Several different conditions can produce similar symptoms, and the available information is not enough to determine the underlying cause without a veterinary assessment. Continue monitoring the reported symptoms and watch closely for worsening behavior, changes in appetite or water intake, increasing weakness, or other warning signs.`,
        nextSteps: [
          "Monitor your pet's symptoms and overall behavior closely.",
          "Keep track of appetite, water intake, energy, and symptom frequency.",
          "Contact a qualified veterinarian if the symptoms persist or worsen.",
        ],
        urgent: Boolean(parsed.urgent),
      };
    }

    if (parsed.status === "FOLLOW_UP") {
      const question = String(
        parsed.question || "",
      ).trim();

      if (!question) {
        throw new Error(
          "AI returned FOLLOW_UP without a question.",
        );
      }

      return {
        status: "FOLLOW_UP",
        question,
        assessment: null,
        nextSteps: [],
        urgent: Boolean(parsed.urgent),
      };
    }

    if (parsed.status === "FINAL") {
      const assessment = String(
        parsed.assessment || "",
      ).trim();

      const nextSteps = Array.isArray(
        parsed.nextSteps,
      )
        ? parsed.nextSteps
            .filter(
              (step) =>
                typeof step === "string" &&
                step.trim().length > 0,
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
          question: null,
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
       * Better fallback.
       *
       * Notice that we do NOT concatenate:
       * "is experiencing" + the owner's sentence.
       */
      return {
        status: "FINAL",
        question: null,
        assessment: `${pet.name}'s current health concern is based on the symptoms and observations you reported during this health check. Several different conditions can produce similar symptoms, so the available information is not enough to determine the exact underlying cause from chat alone. The most important next step is to monitor the symptoms and watch for changes in appetite, water intake, energy, behavior, or any new warning signs. Veterinary evaluation is appropriate if the problem persists, worsens, or becomes concerning.`,
        nextSteps: [
          "Monitor the reported symptoms and your pet's overall behavior.",
          "Keep track of appetite, water intake, energy, and symptom frequency.",
          "Contact a qualified veterinarian if symptoms persist or worsen.",
        ],
        urgent: Boolean(parsed.urgent),
      };
    }

    throw new Error(
      "AI returned an invalid response status.",
    );
  } catch (error) {
    console.error(
      "Failed to parse AI response:",
      content,
    );

    console.error(
      "AI parsing error:",
      error,
    );

    return {
      status: "FINAL",
      question: null,
      assessment: `${pet.name}'s current health concern is based on the symptoms and observations reported during this health check. Several different conditions can produce similar symptoms, and the available information is not enough to determine the exact underlying cause from chat alone. Continue monitoring your pet closely for changes or worsening symptoms, and seek veterinary guidance if the problem persists or concerning signs develop.`,
      nextSteps: [
        "Monitor your pet's symptoms and behavior.",
        "Watch for new or worsening symptoms.",
        "Contact a qualified veterinarian if symptoms persist or worsen.",
      ],
      urgent: false,
    };
  }
}