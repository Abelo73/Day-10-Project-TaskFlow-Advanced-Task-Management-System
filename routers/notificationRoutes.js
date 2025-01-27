const express = require("express");
const {
  createNotification,
  getNotification,
  markAsRead,
} = require("../controllers/notificationController");
const router = express.Router();

router.get("/:userId", getNotification); // Get notifications for a user
router.post("/", createNotification); // Create a new notification
router.patch("/:notificationId", markAsRead);

module.exports = router;
