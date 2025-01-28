// services/notificationService.js
const Notification = require("../models/Notification");

// Send Notification Function
async function sendNotification(
  user,
  type,
  message,
  taskId = null,
  projectId = null,
  metaData = null
) {
  try {
    const notification = new Notification({
      user,
      type,
      message,
      task: taskId,
      project: projectId,
      metaData,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
}

// Create Notification Function (called by controller)
async function createNotification(
  userId,
  message,
  taskId = null,
  projectId = null
) {
  try {
    // Define the notification type based on the context (can be customized)
    const type = taskId ? "TaskUpdate" : "GeneralUpdate";

    // Call sendNotification to create and save the notification
    const notification = await sendNotification(
      userId,
      type,
      message,
      taskId,
      projectId
    );
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

// Other notification functions...
module.exports = {
  createNotification,
  sendNotification,
  // Add other methods here (e.g., getNotificationsByUser, getUnmarkedNotifications, markAsRead)
};
