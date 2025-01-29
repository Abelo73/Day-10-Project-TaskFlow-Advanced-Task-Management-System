const express = require("express");
const checkPermission = require("../middlewares/roleMiddleware");
const authenticateUser = require("../middlewares/authMiddleware");
// const Task = require("../models/Task");
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignUsersToTask,
  unassignUsersFromTask,
} = require("../controllers/taskController");
const router = express.Router();

router.post(
  "/create",
  authenticateUser,
  checkPermission(["CREATE_TASK"]),
  createTask
);
router.get("/", authenticateUser, checkPermission(["GET_TASK"]), getTasks);
router.get(
  "/:id",
  authenticateUser,
  checkPermission(["GET_TASK"]),
  getTaskById
);
router.put(
  "/:id",
  authenticateUser,
  checkPermission(["UPDATE_TASK"]),
  updateTask
);
router.delete(
  "/:id",
  authenticateUser,
  checkPermission(["DELETE_TASK"]),
  deleteTask
);
router.post(
  "/assign-users",
  authenticateUser,
  checkPermission(["ASSIGN_TASK"]),
  assignUsersToTask
);
router.post(
  "/unassign-users",
  authenticateUser,
  checkPermission(["UNASSIGN_TASK"]),
  unassignUsersFromTask
);

module.exports = router;
