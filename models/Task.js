const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED"],
      default: "PENDING",
    },
    dueDate: {
      type: Date,
    },
    assignedTo: {
      type: mongoose.Types.ObjectId,
      ref: "TaskUser",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "TaskUser",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema); //export the model
