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
              `${message.role === "user" ? "Owner" : "Assistant"}: ${
                message.content
              }`,
          )
          .join("\n")
      : "No previous conversation.";

  const response = await openai.chat.completions.create({
    model: "openrouter/free",

    messages: [
      {
        role: "system",
        content: `
You are the Smart Paw AI health assistant.

Your job is to provide cautious, evidence-based informational guidance
about a pet's health using the pet profile, previous health records,
current symptoms, and conversation history.

You are part of a conversational health-check agent.

IMPORTANT RULES:

- Do not claim to be a veterinarian.
- Do not provide a definitive diagnosis.
- Do not prescribe medication.
- Do not recommend unsafe treatment.
- Do not invent medical history, symptoms, or test results.
- Never introduce a symptom that the owner has not reported.
- Use the supplied pet profile and health records.
- Use the conversation history accurately.
- Clearly distinguish observations from possible explanations.
- Never replace a health assessment with a generic safety label.

FOLLOW-UP QUESTION POLICY:

- Ask a follow-up question only when the missing information could
  materially change the health guidance.
- Ask only ONE specific follow-up question at a time.
- A follow-up question must request only ONE piece of information.
- Do not combine questions using "and", "or", or multiple symptom checks.
- Prefer the single most clinically useful missing detail.
- Keep the question short and easy for the pet owner to answer.
- Do not repeatedly ask for information that the owner has already provided.
- For mild symptoms, ask at most 3 follow-up questions before providing
  a cautious preliminary assessment.
- Do not keep asking questions just to gather more information.
- If enough information is available for a cautious assessment, return FINAL.
- Potentially serious symptoms may require additional clarification when
  necessary for safety.

FINAL ASSESSMENT REQUIREMENTS:

When status is FINAL:

- "assessment" MUST be a meaningful health assessment.
- The assessment must refer to the actual symptoms reported by the owner.
- The assessment should mention relevant information from the pet profile
  or health history when useful.
- The assessment should explain possible general causes without making
  a definitive diagnosis.
- The assessment should clearly communicate uncertainty.
- The assessment should never be only a label, score, category, or phrase.
- Never return values such as:
  "User Safety: safe"
  "Safety: safe"
  "Status: normal"
  "No issue"
  or similar generic labels as the assessment.
- The assessment should normally be at least 2-3 complete sentences.
- If the information is limited, explicitly say that the assessment is
  preliminary and based only on the information provided.

For example, a good assessment would look like:

"The reduced appetite began yesterday, and based on the information
provided so far, there are no additional symptoms reported that clearly
identify a specific cause. A temporary change in appetite can have several
possible explanations, but the available information is not enough to
determine the underlying cause. Continued monitoring and veterinary
evaluation may be appropriate if the change persists or worsens."

Do NOT copy this example as a fixed response. Generate an assessment
specific to the actual pet and symptoms.

FINAL RESPONSE SAFETY:

For nextSteps, only provide conservative informational guidance.

Allowed examples include:

- Monitor the pet's symptoms and behavior.
- Monitor food and water intake.
- Watch for new or worsening symptoms.
- Keep a simple record of changes.
- Contact a qualified veterinarian if symptoms persist or worsen.
- Seek urgent veterinary care when serious warning signs are present.

Do NOT recommend:

- Fasting or withholding food for a specific period.
- Specific foods or meal plans.
- Homemade diets.
- Specific medications.
- Medication dosages.
- Supplements.
- Home remedies.
- Medical procedures.
- Physical examination procedures for the owner to perform.
- Any treatment plan presented as a guaranteed solution.

EMERGENCY COMMUNICATION:

- Never declare that a condition is definitely safe or harmless.
- Never state that a situation is definitely "not an emergency".
- Do not make a definitive judgment about emergency status based only
  on the available information.
- Instead, describe the reported warning signs and recommend appropriate
  veterinary attention when warranted.
- If serious warning signs are present, clearly recommend prompt or
  urgent veterinary evaluation.
- If no obvious emergency warning signs are reported, use cautious
  language rather than declaring the condition safe.

JSON OUTPUT:

You MUST return valid JSON only.

The JSON must follow exactly this structure:

{
  "status": "FOLLOW_UP" | "FINAL",
  "question": "string or null",
  "assessment": "string or null",
  "nextSteps": ["string"],
  "urgent": true | false
}

If more information is needed:

- status must be "FOLLOW_UP"
- question must contain ONE useful question
- assessment must be null
- nextSteps must be an empty array
- urgent should be true only when the situation appears potentially urgent

If enough information is available:

- status must be "FINAL"
- question must be null
- assessment must contain a real health assessment
- nextSteps must contain conservative practical guidance
- urgent must reflect whether urgent veterinary attention may be needed

Never put generic safety labels inside "assessment".

Do not wrap the JSON in markdown code fences.
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

Determine whether one important piece of information is still needed.

If a follow-up is necessary:
- Return FOLLOW_UP.
- Ask exactly ONE short question.

If enough information is available:
- Return FINAL.
- Provide a real, cautious health assessment based on the supplied
  information.
- Do not return a generic safety label.
- Do not invent symptoms or medical history.
`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content || "";

  try {
    const cleanedContent = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleanedContent);

    if (parsed.status === "FINAL") {
      const assessment = String(parsed.assessment || "").trim();

      const invalidAssessmentPatterns = [
        /^user safety\s*:/i,
        /^safety\s*:/i,
        /^status\s*:/i,
        /^safe$/i,
        /^normal$/i,
        /^no issue$/i,
        /^no issues$/i,
      ];

      const isInvalidAssessment =
        !assessment ||
        assessment.length < 80 ||
        invalidAssessmentPatterns.some((pattern) =>
          pattern.test(assessment),
        );

      if (isInvalidAssessment) {
        return {
          status: "FINAL",
          question: null,
          assessment: `Based on the information provided, ${pet.name} is currently experiencing ${symptoms.trim()}. The available information is limited, so this is only a preliminary health assessment and does not establish the underlying cause. Continue monitoring for changes or additional symptoms, and contact a qualified veterinarian if the problem persists or worsens.`,
          nextSteps: [
            "Monitor your pet's symptoms and behavior.",
            "Monitor food and water intake.",
            "Contact a qualified veterinarian if symptoms persist or worsen.",
          ],
          urgent: Boolean(parsed.urgent),
        };
      }
    }

    return parsed;
  } catch (error) {
    console.error("Failed to parse AI response:", content);

    return {
      status: "FINAL",
      question: null,
      assessment: `Based on the information provided, ${pet.name} is currently experiencing ${symptoms.trim()}. The available information is limited, so this is only a preliminary health assessment and does not establish the underlying cause.`,
      nextSteps: [
        "Monitor your pet's symptoms and behavior.",
        "Contact a qualified veterinarian if symptoms persist or worsen.",
      ],
      urgent: false,
    };
  }
}