const Project = require("../models/Project");
const User = require("../models/User");
const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { getIO } = require("../sockets");

const memberIdValue = (memberUser) =>
    memberUser?._id?.toString?.() || memberUser?.toString?.();

const listProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find({ "members.user": req.user._id })
        .populate("members.user", "name email")
        .sort({ updatedAt: -1 });

    res.status(200).json({ projects });
});

const createProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        throw new ApiError(400, "Project name is required");
    }

    const project = await Project.create({
        name,
        description,
        owner: req.user._id,
        members: [{ user: req.user._id, role: "admin" }],
    });

    const populated = await Project.findById(project._id).populate(
        "members.user",
        "name email",
    );
    res.status(201).json({ project: populated });
});

const getProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.projectId).populate(
        "members.user",
        "name email",
    );
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const hasAccess = project.members.some(
        (member) => member.user._id.toString() === req.user._id.toString(),
    );
    if (!hasAccess) {
        throw new ApiError(403, "No project access");
    }

    res.status(200).json({ project });
});

const addMember = asyncHandler(async (req, res) => {
    const { email, role } = req.body;
    const project = req.project;

    if (!email || !role) {
        throw new ApiError(400, "Email and role are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const exists = project.members.find(
        (member) => memberIdValue(member.user) === user._id.toString(),
    );
    if (exists) {
        exists.role = role;
    } else {
        project.members.push({ user: user._id, role });
    }

    await project.save();
    await project.populate("members.user", "name email");

    const io = getIO();
    io.to(`project:${project._id}`).emit("project:member-updated", { project });

    res.status(200).json({ project });
});

const removeMember = asyncHandler(async (req, res) => {
    const { memberId } = req.params;
    const project = req.project;

    project.members = project.members.filter(
        (entry) => memberIdValue(entry.user) !== memberId,
    );
    await project.save();
    await project.populate("members.user", "name email");

    await Task.updateMany(
        {
            project: project._id,
            assignedTo: memberId,
        },
        {
            $set: { assignedTo: null },
        },
    );

    const io = getIO();
    io.to(`project:${project._id}`).emit("project:member-updated", { project });

    res.status(200).json({ project });
});

module.exports = {
    listProjects,
    createProject,
    getProject,
    addMember,
    removeMember,
};
