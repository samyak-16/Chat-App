import { io } from "socket.io-client";

let socket = null;

export const initSocket = (token) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_CHAT_APP_SOCKET_URL, {
      auth: { token },
      autoConnect: false,
    });

    socket.connect();

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) throw new Error("Socket not initialized. Call initSocket() first.");
  return socket;
};
