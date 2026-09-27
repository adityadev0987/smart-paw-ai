import Notification from "../models/Notification.js";

export async function getNotifications(req, res) {
  const notifications = await Notification.find({ recipientId: req.user.id }).sort({ createdAt: -1 }).limit(30).lean();
  return res.json({ success: true, notifications });
}

export async function markNotificationRead(req, res) {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, recipientId: req.user.id }, { $set: { readAt: new Date() } }, { new: true });
  if (!notification) return res.status(404).json({ success: false, message: "Notification not found." });
  return res.json({ success: true, notification });
}
