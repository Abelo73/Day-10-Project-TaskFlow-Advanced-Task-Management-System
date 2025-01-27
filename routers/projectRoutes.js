const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  addMemberToProject,
} = require("../controllers/projectController");
const { authenticateUser } = require("../middlewares/authMiddleware");

// router.post("/create", authenticateUser, createProject);
router.get("/find", authenticateUser, getProjects);
// router.post("/assign-user", addMemberToProject);
// router.post("/add-member", addMemberToProject); // Use the destructured name

module.exports = router;
