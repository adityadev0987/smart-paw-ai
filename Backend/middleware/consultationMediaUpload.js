import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import multer from "multer";
import Consultation from "../models/Consultation.js";

const root = path.join(process.cwd(), "uploads", "consultations");
const allowed = new Set(["image/jpeg", "image/png", "image/webp", "audio/webm", "audio/ogg", "audio/wav", "audio/mp4", "audio/mpeg"]);

export async function authorizeConsultationChat(req, res, next) {
  try {
    const id = req.params.consultationId;
    const query = req.user.role === "doctor" ? { _id: id, veterinarianId: req.user.id } : { _id: id, userId: req.user.id };
    const consultation = await Consultation.findOne(query);
    if (!consultation) return res.status(404).json({ success: false, message: "Consultation not found." });
    if (consultation.status !== "IN_PROGRESS") return res.status(409).json({ success: false, message: "This consultation chat is closed." });
    req.consultation = consultation;
    next();
  } catch (error) { next(error); }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(root, String(req.consultation._id));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, _file, cb) => cb(null, `${randomUUID()}.upload`),
});

export const uploadConsultationMedia = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => cb(null, allowed.has(file.mimetype.split(";")[0])),
}).single("media");

export function sniffMedia(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return "image/png";
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  if (buffer.length >= 4 && buffer.toString("ascii", 0, 4) === "OggS") return "audio/ogg";
  if (buffer.length >= 4 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WAVE") return "audio/wav";
  if (buffer.length >= 4 && buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) return "audio/webm";
  if (buffer.length >= 3 && buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) return "audio/mpeg";
  if (buffer.length >= 8 && buffer.toString("ascii", 4, 8) === "ftyp") return "audio/mp4";
  return "";
}
