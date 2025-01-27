const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");

const {
  createProject,
  getProjects,
} = require("../controllers/projectController");

router.post("/create", authenticateUser, createProject);
router.get("/find", authenticateUser, getProjects);

module.exports = router;
