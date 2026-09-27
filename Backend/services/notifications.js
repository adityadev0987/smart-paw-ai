import Notification from "../models/Notification.js";

export async function notifyUser(app, recipientId, consultationId, type, message) {
  if (!recipientId) return;
  const notification = await Notification.create({ recipientId, consultationId, type, message });
  app.get("io")?.to(`user:${recipientId}`).emit("notification:new", notification);
  return notification;
}
