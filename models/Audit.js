const mongoose = require("mongoose");

// Audit Schema
const auditSchema = new mongoose.Schema({
  actionType: {
    type: String,
    required: true,
    enum: ["create", "update", "delete", "assign", "remove"], // Customize based on your actions
  },
  model: {
    type: String,
    required: true,
    enum: ["Task", "TaskUser", "Notification", "Project"], // List of models to be audited
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "model", // Reference to the respective model (Task, Project, etc.)
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "TaskUser", // Assuming you have a User model
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  changes: {
    type: Map,
    of: String,
    default: {}, // Store changes as a map (useful for "update" actions)
  },
  description: {
    type: String,
    required: true,
  },
  ipAddress: {
    type: String, // Store the IP address of the user for security reasons
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}, // Store additional metadata if necessary
  },
});

// Model
const Audit = mongoose.model("Audit", auditSchema);

module.exports = Audit;
