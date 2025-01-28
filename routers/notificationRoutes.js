const express = require("express");
const {
  createNotification,
  getNotification,
  markAsRead,
  getUnMarkedNotification,
} = require("../controllers/notificationController");
const router = express.Router();

router.get("/:userId", getNotification); // Get notifications for a user
router.post("/", createNotification); // Create a new notification
router.patch("/:notificationId", markAsRead);
router.get("/unmarked/:userId", getUnMarkedNotification);

module.exports = router;
