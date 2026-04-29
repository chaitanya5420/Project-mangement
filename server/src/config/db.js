const mongoose = require("mongoose");

const connectDB = async () => {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        throw new Error("MONGO_URI is not defined");
    }

    await mongoose.connect(uri, {
        dbName: process.env.MONGO_DB_NAME || "task_manager",
    });

    // eslint-disable-next-line no-console
    console.log("MongoDB connected");
};

module.exports = connectDB;
