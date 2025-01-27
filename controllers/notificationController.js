const mongoose = require("mongoose");
const Notification = require("../models/Notification");

exports.createNotification = async (req, res) => {
  try {
    const { userId, message, taskId = null } = req.body;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Create the notification
    const notification = await Notification.create({
      user: new mongoose.Types.ObjectId(userId), // Use `new` with ObjectId
      message: message,
      task: taskId ? new mongoose.Types.ObjectId(taskId) : null, // Use `new` for taskId as well
    });

    res.status(201).json({
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      message: "Error creating notification",
      error: error.message,
    });
  }
};

exports.getNotification = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Use `new` with ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const notifications = await Notification.find({ user: userObjectId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    // Ensure notificationId is valid
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error marking notification as read",
      error: error.message,
    });
  }
};
