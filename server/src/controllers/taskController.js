const Task = require("../models/Task");
const Project = require("../models/Project");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { getIO } = require("../sockets");

const emitTaskEvent = async (projectId, eventName, payload) => {
    const io = getIO();
    io.to(`project:${projectId}`).emit(eventName, payload);
};

const createChecklistItemId = (index) =>
    `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`;

const sanitizeChecklist = (checklist) => {
    if (!Array.isArray(checklist)) {
        return [];
    }

    return checklist
        .map((item, index) => ({
            id: String(item?.id || item?._id || createChecklistItemId(index)),
            text: String(item?.text || "").trim(),
            completed: Boolean(item?.completed),
        }))
        .filter((item) => item.text);
};

const getPrimaryChecklistLabel = (checklist, fallbackLabel = "") =>
    checklist[0]?.text || fallbackLabel.trim() || "";

const listTasksByProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const hasAccess = project.members.some(
        (member) => member.user.toString() === req.user._id.toString(),
    );
    if (!hasAccess) {
        throw new ApiError(403, "No project access");
    }

    const tasks = await Task.find({ project: projectId })
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

    res.status(200).json({ tasks });
});

const createTask = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const {
        title,
        description,
        status,
        priority,
        dueDate,
        assignedTo,
        checkbox,
        checkboxLabel,
        checklist,
    } = req.body;

    if (!title) {
        throw new ApiError(400, "Task title is required");
    }

    const normalizedChecklist = sanitizeChecklist(checklist);

    const task = await Task.create({
        project: projectId,
        title,
        description,
        status,
        priority,
        dueDate: dueDate || null,
        assignedTo: assignedTo || null,
        checkbox:
            normalizedChecklist.length > 0
                ? normalizedChecklist.every((item) => item.completed)
                : Boolean(checkbox),
        checkboxLabel: getPrimaryChecklistLabel(
            normalizedChecklist,
            checkboxLabel,
        ),
        checklist: normalizedChecklist,
        createdBy: req.user._id,
    });

    const populated = await Task.findById(task._id)
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email");

    await emitTaskEvent(projectId, "task:created", { task: populated });

    res.status(201).json({ task: populated });
});

const updateTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const updates = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    const mutableFields = [
        "title",
        "description",
        "status",
        "priority",
        "dueDate",
        "assignedTo",
        "checkbox",
        "checkboxLabel",
        "checklist",
    ];
    mutableFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(updates, field)) {
            if (field === "checkbox") {
                task[field] = Boolean(updates[field]);
                return;
            }

            if (field === "checkboxLabel") {
                task[field] = updates[field]?.trim() || "";
                return;
            }

            if (field === "checklist") {
                const normalizedChecklist = sanitizeChecklist(updates[field]);
                task[field] = normalizedChecklist;
                task.checkbox =
                    normalizedChecklist.length > 0
                        ? normalizedChecklist.every((item) => item.completed)
                        : false;
                task.checkboxLabel = normalizedChecklist[0]?.text || "";
                return;
            }

            task[field] = updates[field];
        }
    });

    await task.save();

    const populated = await Task.findById(task._id)
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email");

    await emitTaskEvent(task.project, "task:updated", { task: populated });

    res.status(200).json({ task: populated });
});

const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    await Task.findByIdAndDelete(taskId);
    await emitTaskEvent(task.project, "task:deleted", { taskId });

    res.status(200).json({ message: "Task deleted" });
});

module.exports = {
    listTasksByProject,
    createTask,
    updateTask,
    deleteTask,
};
