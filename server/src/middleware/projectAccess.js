const mongoose = require("mongoose");
const Project = require("../models/Project");
const Task = require("../models/Task");

const getProjectMembership = async (projectId, userId) => {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return null;
    }

    const project = await Project.findById(projectId).populate(
        "members.user",
        "name email",
    );
    if (!project) {
        return null;
    }

    const member = project.members.find(
        (entry) => entry.user._id.toString() === userId.toString(),
    );

    if (!member) {
        return null;
    }

    return { project, role: member.role };
};

const requireProjectRole =
    (...roles) =>
    async (req, res, next) => {
        const projectId = req.params.projectId || req.body.projectId;
        const result = await getProjectMembership(projectId, req.user._id);

        if (!result) {
            return res.status(403).json({ message: "No project access" });
        }

        if (!roles.includes(result.role)) {
            return res.status(403).json({ message: "Insufficient role" });
        }

        req.project = result.project;
        req.projectRole = result.role;
        return next();
    };

const requireTaskRole =
    (...roles) =>
    async (req, res, next) => {
        const task = await Task.findById(req.params.taskId).select("project");

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const result = await getProjectMembership(task.project, req.user._id);

        if (!result) {
            return res.status(403).json({ message: "No project access" });
        }

        if (!roles.includes(result.role)) {
            return res.status(403).json({ message: "Insufficient role" });
        }

        req.project = result.project;
        req.projectRole = result.role;
        return next();
    };

module.exports = { getProjectMembership, requireProjectRole, requireTaskRole };
