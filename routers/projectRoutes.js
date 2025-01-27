const express = require("express");
const router = express.Router();
const {
  removeMemberFromProject,
  createProject,
  getProjects,
  addMemberToProject,
} = require("../controllers/projectController");
const { authenticateUser } = require("../middlewares/authMiddleware");

// router.post("/create", authenticateUser, createProject);
router.post("/create", authenticateUser, createProject);
router.get("/find", authenticateUser, getProjects);
// router.post("/assign-user", addMemberToProject);
router.post("/add-member", authenticateUser, addMemberToProject); // Use the destructured name
router.post("/remove-member", authenticateUser, removeMemberFromProject);

module.exports = router;
