require("dotenv").config();
const http = require("http");

const app = require("./app");
const connectDB = require("./config/db");
const { initSocket } = require("./sockets");

const port = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    const server = http.createServer(app);
    initSocket(server);

    server.on("error", (error) => {
        if (error.code === "EADDRINUSE") {
            // eslint-disable-next-line no-console
            console.warn(
                `Port ${port} is already in use. Another API instance may already be running, so skipping startup.`,
            );
            process.exit(0);
        }

        throw error;
    });

    server.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`API server running on port ${port}`);
    });
};

startServer().catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start server", error);
    process.exit(1);
});
