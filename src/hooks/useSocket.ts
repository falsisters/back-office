"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export function useSocket(namespace = "/sales") {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(`${SOCKET_URL}${namespace}`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [namespace]);

  const on = (event: string, callback: (...args: unknown[]) => void) => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  };

  return { on };
}
