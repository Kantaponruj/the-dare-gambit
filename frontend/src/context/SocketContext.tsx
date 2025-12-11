import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Allow polling first with websocket upgrade fallback — more robust behind proxies
    const newSocket = io(import.meta.env.VITE_API_URL, {
      transports: ["polling", "websocket"],
      reconnectionAttempts: 10,
      reconnectionDelayMax: 2000,
      forceNew: true,
    });
    // Ensure we request latest state when the socket connects or reconnects
    const handleConnect = () => {
      console.log("Socket connected", newSocket.id);
      try {
        newSocket.emit("tournament:get_state");
        newSocket.emit("match:get_state");
      } catch (e) {
        console.warn("Failed to request initial state on connect", e);
      }
    };

    const handleConnectError = (err: any) => {
      console.warn("Socket connect error:", err);
    };

    newSocket.on("connect", handleConnect);
    newSocket.on("connect_error", handleConnectError);
    setSocket(newSocket);

    return () => {
      newSocket.off("connect", handleConnect);
      newSocket.off("connect_error", handleConnectError);
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
