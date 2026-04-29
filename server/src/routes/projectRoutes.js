const express = require("express");
const {
    listProjects,
    createProject,
    getProject,
    addMember,
    removeMember,
} = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");
const { requireProjectRole } = require("../middleware/projectAccess");

const router = express.Router();

router.use(protect);

router.route("/").get(listProjects).post(createProject);
router.get("/:projectId", getProject);
router.post("/:projectId/members", requireProjectRole("admin"), addMember);
router.delete(
    "/:projectId/members/:memberId",
    requireProjectRole("admin"),
    removeMember,
);

module.exports = router;
