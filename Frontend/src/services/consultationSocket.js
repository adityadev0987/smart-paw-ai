import { io } from "socket.io-client";

export function connectConsultationSocket() {
  const token = localStorage.getItem("smartPawToken");
  return io(import.meta.env.VITE_API_ORIGIN || "http://localhost:5000", {
    auth: { token },
    transports: ["websocket", "polling"],
  });
}
