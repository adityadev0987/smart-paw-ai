import Pet from "../models/Pet.js";
import { runHealthAgent } from "../agent/agent.js";

export const healthCheck = async (req, res) => {
  try {
    const {
      petId,
      symptoms,
      conversation = [],
    } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

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

    const pet = await Pet.findOne({
      _id: petId,
      userId: req.user.id,
    });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found.",
      });
    }

    const result = await runHealthAgent({
      petId,
      symptoms: symptoms.trim(),
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