const express = require("express");
const {
  createNotification,
  getNotification,
  markAsRead,
} = require("../controllers/notificationController");
const router = express.Router();

router.get("/:userId", getNotification);
router.post("/", createNotification);
router.patch("/:notificationId", markAsRead);

module.exports = router;
