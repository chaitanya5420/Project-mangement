const mongoose = require("mongoose");

const checklistItemSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { _id: false },
);

const taskSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        status: {
            type: String,
            enum: ["todo", "in_progress", "done", "archived"],
            default: "todo",
            index: true,
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
        startDate: {
            type: Date,
            default: null,
        },
        dueDate: {
            type: Date,
            default: null,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        checkbox: {
            type: Boolean,
            default: false,
        },
        checkboxLabel: {
            type: String,
            default: "",
            trim: true,
        },
        checklist: {
            type: [checklistItemSchema],
            default: [],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model("Task", taskSchema);
