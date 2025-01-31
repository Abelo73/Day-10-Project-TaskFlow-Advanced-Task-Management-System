const express = require("express");
const router = express.Router();
const {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addMemberToTeam,
  removeMemberFromTeam,
  addProjectToTeam,
  removeProjectFromTeam,
} = require("../controllers/teamController");

const checkPermission = require("../middlewares/roleMiddleware");
const authenticateUser = require("../middlewares/authMiddleware");

router.post("/", authenticateUser, createTeam);
router.get("/", authenticateUser, getTeams);
router.get("/:id", authenticateUser, getTeamById);
router.put("/:id", authenticateUser, updateTeam);
router.delete("/:id", authenticateUser, deleteTeam);
router.post("/:id/add-member", authenticateUser, addMemberToTeam);
router.post("/:id/remove-member", authenticateUser, removeMemberFromTeam);
router.post("/:id/add-project", authenticateUser, addProjectToTeam);
router.post("/:id/remove-project", authenticateUser, removeProjectFromTeam);

module.exports = router;
