const mongoose = require("mongoose");

const accessControlSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
    },
    permissions: {
      type: [String], // Example : ["CREATE_TASK", "DELETE_TASK", "GET_TASK"]
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AccessControl", accessControlSchema);
