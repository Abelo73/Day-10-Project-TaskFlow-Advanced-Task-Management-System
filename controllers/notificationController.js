const Notification = require("../models/Notification");
// const Task = require("../models/Task");
// const TaskUser = require("../models/User");

exports.createNotification = async (req, res) => {
  try {
    const { userId, message, taskId = null } = req.body; // Get the data from the request body
    const notification = await Notification.create({
      user: userId,
      message: message,
      task: taskId,
    });

    res.status(201).json({
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error creating notification",
      error: error.message, // Add the error message to the response
    });
  }
};

exports.getNotification = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from URL params
    console.log("USER Notfication Request:", userId);
    const notifications = await Notification.find({ user: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      notifications,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

// Controller method to mark a notification as read
// exports.markAsRead = async (req, res) => {
//   try {
//     const { notificationId } = req.params; // Get notification ID from URL params
//     console.log("NotificationId ", notificationId);
//     const notification = await Notification.findByIdAndUpdate(
//       notificationId,
//       { isRead: true },
//       { new: true }
//     );

//     console.log("Notfication isRead updated, ", notification);

//     res.status(200).json({
//       message: "Notification marked as read",
//       notification,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       message: "Error marking notification as read",
//       error: error.message,
//     });
//   }
// };

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params; // Make sure you are getting notificationId from params

    if (!notificationId) {
      return res.status(400).json({ message: "Notification ID is required" });
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
