const mongoose = require("mongoose");

const accessControlSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: [
        "USER",
        "ADMIN",
        "MANAGER",
        "MEMBER",
        "GUEST",
        "CUSTOMER_SUPPORT",
        "TEAM_LEAD",
        "SUPERVISOR",
        "TEST",
        "TESnT",
      ],
      required: true,
      unique: true,
    },
    permissions: {
      type: [String],
      required: true,
      validate: {
        validator: function (permissions) {
          // Ensure permissions array is not empty
          return permissions.length > 0;
        },
        message: "Permissions array cannot be empty.",
      },
      // Custom validator to check for unique permissions within the array
      set: function (permissions) {
        return [...new Set(permissions)]; // This removes duplicates
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AccessControl", accessControlSchema);
