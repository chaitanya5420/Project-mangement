const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            credentials: true,
        },
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error("Unauthorized"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            return next();
        } catch (error) {
            return next(new Error("Unauthorized"));
        }
    });

    io.on("connection", (socket) => {
        socket.on("project:join", (projectId) => {
            socket.join(`project:${projectId}`);
        });

        socket.on("project:leave", (projectId) => {
            socket.leave(`project:${projectId}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }

    return io;
};

module.exports = { initSocket, getIO };
