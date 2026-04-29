const mongoose = require("mongoose");
const Project = require("../models/Project");
const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");

const getDashboardData = asyncHandler(async (req, res) => {
    const userProjects = await Project.find({
        "members.user": req.user._id,
    }).select("_id name");
    const projectIds = userProjects.map((project) => project._id);

    const [statusStats, priorityStats, dueSoonTasks] = await Promise.all([
        Task.aggregate([
            { $match: { project: { $in: projectIds } } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        Task.aggregate([
            { $match: { project: { $in: projectIds } } },
            { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]),
        Task.find({
            project: { $in: projectIds },
            dueDate: {
                $gte: new Date(),
                $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
            status: { $ne: "done" },
        })
            .populate("project", "name")
            .populate("assignedTo", "name email")
            .sort({ dueDate: 1 })
            .limit(10),
    ]);

    res.status(200).json({
        projectsCount: userProjects.length,
        tasksByStatus: statusStats.map((entry) => ({
            status: entry._id,
            count: entry.count,
        })),
        tasksByPriority: priorityStats.map((entry) => ({
            priority: entry._id,
            count: entry.count,
        })),
        dueSoonTasks,
    });
});

module.exports = { getDashboardData };
