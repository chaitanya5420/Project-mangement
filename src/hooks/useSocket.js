"use client";

import { useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";

export function useSocket(projectId) {
    const token = useAuthStore((state) => state.token);

    const socket = useMemo(() => {
        if (!token) {
            return null;
        }

        return io(
            process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
            {
                auth: { token },
                transports: ["websocket"],
            },
        );
    }, [token]);

    useEffect(() => {
        if (!socket || !projectId) {
            return undefined;
        }

        socket.emit("project:join", projectId);

        return () => {
            socket.emit("project:leave", projectId);
            socket.disconnect();
        };
    }, [socket, projectId]);

    return socket;
}
