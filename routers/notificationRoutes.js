const express = require("express");
const {
  createNotification,
  getNotification,
  markAsRead,
  getUnMarkedNotification,
} = require("../controllers/notificationController");
const router = express.Router();

router.get("/", getNotification); // Get notifications for a user
router.post("/create", createNotification); // Create a new notification
router.patch("/:notificationId", markAsRead);
router.get("/unmarked/:userId", getUnMarkedNotification);

module.exports = router;
