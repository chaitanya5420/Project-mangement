const express = require("express");
const {
    listTasksByProject,
    createTask,
    updateTask,
    deleteTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");
const {
    requireProjectRole,
    requireTaskRole,
} = require("../middleware/projectAccess");

const router = express.Router();

router.use(protect);

router.get("/project/:projectId", listTasksByProject);
router.post(
    "/project/:projectId",
    requireProjectRole("admin", "member"),
    createTask,
);
router.patch("/:taskId", requireTaskRole("admin", "member"), updateTask);
router.delete("/:taskId", requireTaskRole("admin"), deleteTask);

module.exports = router;
