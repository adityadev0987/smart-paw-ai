import Pet from "../models/Pet.js";
import { runHealthAgent } from "../agent/agent.js";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { sniffMedia } from "../middleware/consultationMediaUpload.js";

const aiMediaRoot = path.join(process.cwd(), "uploads", "ai-health");
const aiMediaTypes = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "audio/webm": "webm", "audio/ogg": "ogg", "audio/wav": "wav", "audio/mp4": "m4a", "audio/mpeg": "mp3" };

export const uploadHealthCheckMedia = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Choose an image or audio recording." });
    const mimeType = sniffMedia(req.file.buffer.subarray(0, 32));
    if (!mimeType || !aiMediaTypes[mimeType] || req.file.mimetype.split(";")[0] !== mimeType) return res.status(400).json({ success: false, message: "The file does not match a supported image or audio format." });
    const ownerDir = path.join(aiMediaRoot, String(req.user.id));
    await fs.mkdir(ownerDir, { recursive: true });
    const filename = `${randomUUID()}.${aiMediaTypes[mimeType]}`;
    await fs.writeFile(path.join(ownerDir, filename), req.file.buffer, { flag: "wx" });
    return res.status(201).json({ success: true, mediaUrl: `/ai/health-check/media/${filename}`, mediaMimeType: mimeType });
  } catch (error) { console.error("AI health media upload error:", error); return res.status(500).json({ success: false, message: "Unable to save this health check media." }); }
};

export const getHealthCheckMedia = async (req, res) => {
  try {
    if (!/^[\da-f-]{36}\.(jpg|png|webp|webm|ogg|wav|m4a|mp3)$/i.test(req.params.filename)) return res.status(404).end();
    const mediaPath = path.join(aiMediaRoot, String(req.user.id), req.params.filename);
    const bytes = await fs.readFile(mediaPath);
    const mimeType = sniffMedia(bytes.subarray(0, 32));
    if (!mimeType) return res.status(404).end();
    res.setHeader("Content-Type", mimeType); res.setHeader("Cache-Control", "private, no-store");
    return res.send(bytes);
  } catch (error) { if (error.code === "ENOENT") return res.status(404).end(); console.error("AI health media read error:", error); return res.status(500).end(); }
};

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
