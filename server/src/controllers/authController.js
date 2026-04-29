const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { signToken } = require("../utils/jwt");

const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, "Name, email and password are required");
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
        throw new ApiError(409, "Email already exists");
    }

    const user = await User.create({ name, email, password });
    const token = signToken({ id: user._id });

    res.status(201).json({
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
        "+password",
    );
    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new ApiError(401, "Invalid credentials");
    }

    const token = signToken({ id: user._id });

    res.status(200).json({
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    });
});

const me = asyncHandler(async (req, res) => {
    res.status(200).json({ user: req.user });
});

module.exports = { register, login, me };
