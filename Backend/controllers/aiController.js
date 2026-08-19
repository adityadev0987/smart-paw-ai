import { runHealthAgent } from "../agent/agent.js";

export const healthCheck = async (req, res) => {
  try {
    const {
      petId,
      symptoms,
      conversation = [],
    } = req.body;

    if (!petId || !symptoms?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Pet ID and symptoms are required.",
      });
    }

    if (!Array.isArray(conversation)) {
      return res.status(400).json({
        success: false,
        message: "Conversation must be an array.",
      });
    }

    const result = await runHealthAgent({
      petId,
      symptoms,
      conversation,
    });

    res.status(200).json({
      success: true,
      message: "Health insight generated successfully.",
      data: result,
    });
  } catch (error) {
    console.error("AI health check error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate health insight.",
    });
  }
};