const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: {
        values: ["PENDING", "IN_PROGRESS", "COMPLETED"],
        message: "Invalid status value",
      },
      default: "PENDING",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "LOW",
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (date) {
          return !date || date > Date.now();
        },
        message: "Due date must be in the future",
      },
    },
    // assignedTo: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "TaskUser",
    //     validate: {
    //       validator: function (users) {
    //         if (!Array.isArray(users)) return false; // Ensure users is an array
    //         const uniqueUsers = new Set(users.map((user) => user.toString()));
    //         return users.length <= 5 && uniqueUsers.size === users.length;
    //       },
    //       message: "Cannot assign to more than 5 unique users",
    //     },
    //   },
    // ],
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TaskUser",
        validate: {

          validator: function (users) {
            if (!Array.isArray(users)) return false; // Ensure `assignedTo` is an array
            const uniqueUsers = new Set(users.map((user) => user.toString()));
            return users.length <= 5 && uniqueUsers.size === users.length;
          },
          message: "Cannot assign to more than 5 unique users",
        },
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaskUser",
      required: [true, "Creator ID is required"],
    },
    deletedAt: {
      type: Date,
      default: null, // For soft delete
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property for overdue status
taskSchema.virtual("isOverdue").get(function () {
  return this.dueDate < Date.now() && this.status !== "COMPLETED";
});

// Indexes for faster querying
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ status: 1, priority: 1, dueDate: 1 }); // Compound index

// Default query filtering (soft delete)
taskSchema.pre(/^find/, function (next) {
  this.where({ deletedAt: null }).sort({ dueDate: 1 }); // Default sorting
  next();
});

// Prevent creator updates
taskSchema.pre("save", function (next) {
  if (!this.isNew && this.isModified("createdBy")) {
    throw new Error("The creator of a task cannot be changed");
  }
  next();
});

// Apply soft delete to update queries
taskSchema.pre(/^findOneAndUpdate/, function (next) {
  this.setQuery({ ...this.getQuery(), deletedAt: null });
  next();
});

// Audit logging on task updates
taskSchema.post("save", function (doc) {
  if (this.isNew) {
    console.log(`Task ${doc._id} was created at ${doc.createdAt}`);
  } else {
    console.log(`Task ${doc._id} was updated at ${doc.updatedAt}`);
  }
});

module.exports = mongoose.model("Task", taskSchema);
