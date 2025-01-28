const mongoose = require("mongoose");
const Notification = require("../models/Notification");

exports.createNotification = async (req, res) => {
  try {
    const { userId, message, taskId = null } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const notification = await Notification.create({
      user: new mongoose.Types.ObjectId(userId),
      message: message,
      task: taskId ? new mongoose.Types.ObjectId(taskId) : null,
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

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

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
exports.getUnMarkedNotification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query; // Default values: page 1, limit 10

    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Query unmarked notifications with pagination
    const unMarkedNotifications = await Notification.find({
      user: userId,
      isRead: false,
    })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    // Get the total count of unmarked notifications
    const total = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });

    // Check if notifications are found
    if (!unMarkedNotifications.length) {
      return res.status(404).json({
        message: "No unmarked notifications found",
        status: false,
      });
    }

    // Return paginated response
    return res.status(200).json({
      message: "Unmarked notifications found",
      status: true,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      data: unMarkedNotifications,
    });
  } catch (error) {
    console.error("Error fetching unmarked notifications:", error);
    return res.status(500).json({
      message: "An error occurred while fetching unmarked notifications",
      status: false,
      error: error.message,
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

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
