import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Consultation from "../models/Consultation.js";
import User from "../models/User.js";

export function initializeRealtime(server, app) {
  const io = new Server(server, { cors: { origin: true, credentials: true } });
  app.set("io", io);
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("role doctorProfile.isApproved");
      if (!user || (user.role === "doctor" && !user.doctorProfile?.isApproved)) return next(new Error("Unauthorized"));
      socket.data.userId = user._id.toString();
      socket.data.role = user.role;
      return next();
    } catch {
      return next(new Error("Unauthorized"));
    }
  });
  io.on("connection", async (socket) => {
    socket.join(`user:${socket.data.userId}`);
    if (socket.data.role === "doctor") await User.updateOne({ _id: socket.data.userId }, { $set: { "doctorProfile.isOnline": true } });
    socket.on("consultation:join", async (consultationId, callback = () => {}) => {
      try {
        const access = socket.data.role === "doctor" ? { veterinarianId: socket.data.userId } : { userId: socket.data.userId };
        const consultation = await Consultation.exists({ _id: consultationId, ...access });
        if (!consultation) return callback({ success: false, message: "Consultation access denied." });
        socket.join(`consultation:${consultationId}`);
        return callback({ success: true });
      } catch {
        return callback({ success: false, message: "Unable to join consultation room." });
      }
    });
    socket.on("disconnect", async () => {
      if (socket.data.role === "doctor") {
        const stillConnected = (await io.in(`user:${socket.data.userId}`).fetchSockets()).length > 0;
        if (!stillConnected) await User.updateOne({ _id: socket.data.userId }, { $set: { "doctorProfile.isOnline": false, "doctorProfile.lastSeenAt": new Date() } });
      }
    });
  });
  return io;
}
