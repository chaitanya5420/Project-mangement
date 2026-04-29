const errorMiddleware = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";

    // eslint-disable-next-line no-console
    console.error(err);

    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
};

module.exports = { errorMiddleware };
