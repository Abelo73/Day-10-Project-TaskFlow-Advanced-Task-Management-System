const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: {
        values: ["PLANNING", "IN_PROGRESS", "COMPLETED", "ON_HOLD"],
        message: "Invalid status value",
      },
      default: "PLANNING",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      validate: {
        validator: function (date) {
          return date > Date.now(); // Start date should be in the future
        },
        message: "Start date must be in the future",
      },
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (date) {
          return date > this.startDate; // End date should be after start date
        },
        message: "End date must be after the start date",
      },
    },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task", // Linking tasks to the project
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TaskUser", // Members of the project, users who are part of the project team
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaskUser", // The user who created the project
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null, // For soft delete
    },
  },
  {
    timestamps: true, // Enable createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property to calculate project duration
projectSchema.virtual("duration").get(function () {
  const diffTime = new Date(this.endDate) - new Date(this.startDate);
  return Math.ceil(diffTime / (1000 * 3600 * 24)); // Duration in days
});

// Indexes for faster querying
projectSchema.index({ status: 1 });
projectSchema.index({ startDate: 1 });
projectSchema.index({ endDate: 1 });

// Pre-hooks for project soft delete
projectSchema.pre(/^find/, function (next) {
  this.where({ deletedAt: null }); // Filter out deleted projects
  next();
});

// Prevent creator updates
projectSchema.pre("save", function (next) {
  if (!this.isNew && this.isModified("createdBy")) {
    throw new Error("The creator of a project cannot be changed");
  }
  next();
});

// Apply soft delete to update queries
projectSchema.pre(/^findOneAndUpdate/, function (next) {
  this.setQuery({ ...this.getQuery(), deletedAt: null });
  next();
});

// Audit logging on project updates
projectSchema.post("save", function (doc) {
  if (this.isNew) {
    console.log(`Project ${doc._id} was created at ${doc.createdAt}`);
  } else {
    console.log(`Project ${doc._id} was updated at ${doc.updatedAt}`);
  }
});

module.exports = mongoose.model("Project", projectSchema);
