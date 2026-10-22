import { io } from "socket.io-client";

export function connectConsultationSocket() {
  const token = localStorage.getItem("smartPawToken");
  return io({
    auth: { token },
    transports: ["websocket", "polling"],
  });
}
