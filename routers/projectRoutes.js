const express = require("express");
const router = express.Router();
const {
  removeMemberFromProject,
  createProject,
  getProjects,
  addMemberToProject,
  getProjectById,
  deleteProjectById,
} = require("../controllers/projectController");
// const { authenticateUser } = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/roleMiddleware");
const authenticateUser = require("../middlewares/authMiddleware");

// router.post("/create", authenticateUser, createProject);
router.post(
  "/create",
  authenticateUser,
  checkPermission(["CREATE_PROJECT"]),
  createProject
);
router.get(
  "/find",
  authenticateUser,
  checkPermission(["GET_PROJECT"]),
  getProjects
);

// router.post("/assign-user", addMemberToProject);
router.post(
  "/add-member",
  authenticateUser,
  checkPermission(["ASSIGN_PROJECT"]),
  addMemberToProject
); // Use the destructured name
router.post(
  "/remove-member",
  authenticateUser,
  checkPermission(["UNASSIGN_PROJECT"]),
  removeMemberFromProject
);

router.get("/:id", authenticateUser, checkPermission(["GET_PROJECT"]), getProjectById);

router.delete(
  "/delete/:id",
  authenticateUser,
  checkPermission(["DELETE_PROJECT"]),
  deleteProjectById
);

module.exports = router;
