const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaskUser",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "TaskUpdate", // Updates to a task (comments, file uploads, edits)
        "TaskAssignment", // When a task is assigned
        "StatusChange", // When task/project status changes
        "PriorityChange", // When task priority changes
        "ProjectUpdate", // Updates related to a project
        "ProjectRemoval",
        "ProjectAssignment",
        "GeneralNotification", // For other general notifications
      ],
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metaData: {
      type: Object, // Store additional details, like old/new priority or status
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
