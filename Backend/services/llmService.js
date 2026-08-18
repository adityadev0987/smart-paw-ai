import OpenAI from "openai";

export async function generateHealthInsight({
  pet,
  healthRecords,
  symptoms,
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

  const response = await openai.chat.completions.create({
    model: "openrouter/free",

    messages: [
      {
        role: "system",
        content: `
You are the Smart Paw AI health assistant.

Your job is to provide cautious, evidence-based informational guidance
about a pet's health using the pet profile, previous health records,
and the symptoms currently reported by the owner.

Rules:
- Do not claim to be a veterinarian.
- Do not provide a definitive diagnosis.
- Do not prescribe medication.
- Do not recommend unsafe treatment.
- Do not invent medical history, symptoms, or test results.
- Clearly distinguish observations from possible explanations.
- If symptoms may indicate a serious or emergency condition, recommend
  contacting a qualified veterinarian or seeking urgent veterinary care.
- Use the supplied health history when it is relevant.
- Give practical next steps the owner can safely discuss with a veterinarian.
- Keep the answer clear and understandable.
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

Based on the complete information above, provide a cautious health
assessment and recommended next steps.
`,
      },
    ],
  });

  return response.choices[0]?.message?.content || "";
}