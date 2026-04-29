const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const searchUsers = asyncHandler(async (req, res) => {
    const q = req.query.q || "";

    const users = await User.find({
        $or: [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
        ],
    })
        .select("name email")
        .limit(20);

    res.status(200).json({ users });
});

module.exports = { searchUsers };
