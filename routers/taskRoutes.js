const express = require("express");
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

router.post("/create", createTask);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.post("/assign-users", assignUsersToTask);
router.post("/unassign-users", unassignUsersFromTask);

module.exports = router;
