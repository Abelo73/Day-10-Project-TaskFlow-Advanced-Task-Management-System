// controllers/notificationController.js
const notificationService = require("../service/notificationService");
const Notification = require("../models/Notification");

exports.createNotification = async (req, res) => {
  try {
    const { userId, message, taskId = null } = req.body;

    // Call the service to create the notification
    const notification = await notificationService.createNotification(
      userId,
      message,
      taskId
    );

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
    const { userId } = req.query;
    const filter = userId ? { user: userId } : {};

    // Fetch notifications with population and sorting
    const notifications = await Notification.find(filter)
      .populate("user", "name email")
      .populate("task", "title")
      .populate("project", "name")
      .sort({ createdAt: -1 });

    // Check if notifications array is empty
    if (notifications.length === 0) {
      return res.status(404).json({
        message: "No notifications found",
        status: false,
        data: [],
      });
    }

    // Return success response with notifications data
    res.status(200).json({
      message: "Notifications fetched successfully",
      status: true,
      data: notifications,
    });
  } catch (error) {
    // Log the error and send a server error response
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      message: "Server error occurred while fetching notifications",
      status: false,
      error: error.message,
    });
  }
};

exports.getUnMarkedNotification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const { unmarkedNotifications, total } =
      await notificationService.getUnmarkedNotifications(userId, page, limit);

    if (!unmarkedNotifications.length) {
      return res.status(404).json({
        message: "No unmarked notifications found",
        status: false,
      });
    }

    return res.status(200).json({
      message: "Unmarked notifications found",
      status: true,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      data: unmarkedNotifications,
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

    const notification = await notificationService.markAsRead(notificationId);

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
