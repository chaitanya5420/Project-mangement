const mongoose = require("mongoose");

const projectMemberSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        role: {
            type: String,
            enum: ["admin", "member", "viewer"],
            default: "member",
        },
    },
    { _id: false },
);

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        members: {
            type: [projectMemberSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    },
);

projectSchema.index({ owner: 1 });
projectSchema.index({ "members.user": 1 });

module.exports = mongoose.model("Project", projectSchema);
