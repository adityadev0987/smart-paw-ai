import { runHealthAgent } from "../agent/agent.js";

export const healthCheck = async (req, res) => {
  try {
    const { petId, symptoms } = req.body;

    if (!petId || !symptoms?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Pet ID and symptoms are required.",
      });
    }

    const context = await runHealthAgent({
      petId,
      symptoms,
    });

    res.status(200).json({
      success: true,
      message: "Health context generated successfully.",
      data: context,
    });
  } catch (error) {
    console.error("AI health check error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate health context.",
    });
  }
};