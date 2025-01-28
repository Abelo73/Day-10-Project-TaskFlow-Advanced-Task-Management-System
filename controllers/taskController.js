const { getSocket } = require("../socket");
const Task = require("../models/Task");
const Audit = require("../models/Audit");
const TaskUser = require("../models/User");
const { ObjectId } = require("mongodb");
const Notification = require("../models/Notification");

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedTo, createdBy } =
      req.body;

    // Create the new task
    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      createdBy,
    });

    // Save the task to the database
    const savedTask = await task.save();

    console.log("Saved Task", savedTask);

    // Create audit record

    const audit = new Audit({
      actionType: "create",
      model: "Task",
      documentId: task.createdBy,
      userId: task.createdBy,
      description: `Task "${task.title}" created`,
    });

    console.log("Saved Audit");

    await audit.save();

    // Send notifications to the users assigned to the task
    const message = `You have been assigned to the task "${savedTask.title}".`;
    assignedTo.forEach((userId) => {
      Notification.create({
        user: userId,
        type: "TaskAssignment",
        task: savedTask._id,
        message: message,
      });

      const io = getSocket();
      io.emit("taskNotification", {
        message: message,
        taskId: savedTask._id,
        type: "TaskCreated",
        taskTitle: savedTask.title,
      });

      io.to(userId).emit("taskNotification", {
        message: message,
        taskId: savedTask._id,
        taskTitle: savedTask.title,
      });
    });

    res.status(201).json({
      message: "Task created successfully",
      task: savedTask,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({
      message: "Error creating task",
      error: error.message,
    });
  }
};
// Get All Tasks with optional filters

exports.getTasks = async (req, res) => {
  try {
    // Destructuring filters, sorting, pagination from query parameters
    const {
      status,
      priority,
      createdBy,
      assignedTo, // User ID(s) for filtering assigned tasks
      dueDate,
      page = 1, // Default to page 1 if not provided
      limit = 10, // Default to 10 tasks per page
      sortBy = "dueDate", // Default sorting field
      sortOrder = "asc", // Default sort order
    } = req.query;

    // Build filter object based on query params
    const filters = { deletedAt: null };
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (createdBy) filters.createdBy = createdBy;
    if (dueDate) filters.dueDate = { $gte: new Date(dueDate) }; // Filter by due date (greater than or equal)

    // Check if assignedTo is provided and handle as an array of user IDs
    if (assignedTo) {
      // If assignedTo is a single ID (string), convert to array for consistent handling
      const assignedToArray = Array.isArray(assignedTo)
        ? assignedTo
        : [assignedTo];
      filters.assignedTo = { $in: assignedToArray }; // Filter tasks assigned to these user IDs
    }

    // Sorting order based on query params (asc or desc)
    const sortOptions = {
      [sortBy]: sortOrder === "desc" ? -1 : 1,
    };

    // Calculate the number of records to skip for pagination
    const skip = (page - 1) * limit;

    // Fetch the tasks with pagination, filtering, and sorting
    const tasks = await Task.find(filters)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    // Get total count of filtered tasks for pagination
    const totalTasks = await Task.countDocuments(filters);

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalTasks / limit);

    // Send paginated response
    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        totalTasks,
        totalPages,
        currentPage: page,
        tasksPerPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// GET a single Task by ID

exports.getTaskById = async (Req, res) => {
  try {
    const task = await Task.findById(Req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Update a task by id

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: task,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.assignUsersToTask = async (req, res) => {
  try {
    const { taskId, assignedUsers } = req.body;

    // Ensure assignedUsers is an array
    if (!Array.isArray(assignedUsers)) {
      return res.status(400).json({
        message: "Assigned users must be an array",
      });
    }

    // Ensure all users exist
    const users = await TaskUser.find({ _id: { $in: assignedUsers } });
    if (users.length !== assignedUsers.length) {
      return res.status(400).json({
        message: "Some users are invalid or do not exist",
      });
    }

    // Check if any of the users are already assigned to the task
    const existingAssignment = await Task.findOne({
      _id: taskId,
      assignedTo: { $in: assignedUsers }, // Check if any of the assigned users are already assigned to the task
    });

    if (existingAssignment) {
      return res.status(400).json({
        status: false,
        message: "One or more users are already assigned to this task",
      });
    }

    // Proceed with assigning users to the task
    const task = await Task.findByIdAndUpdate(
      taskId,
      { assignedTo: assignedUsers },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const message = `You have been assigned to task ${task.title}`;
    const io = getSocket();

    // Emit task assignment notification to all connected users
    io.emit("taskAssigned", {
      message: message,
      taskId: task._id,
      taskTitle: task.title,
    });

    // Emit real-time assignment notification to the assigned users
    assignedUsers.forEach((userId) => {
      io.to(userId).emit("taskAssigned", {
        message: message,
        taskId: task._id,
        taskTitle: task.title,
      });
    });
    const audit = new Audit({
      actionType: "assign",
      model: "Task",
      documentId: task.createdBy,
      userId: task.createdBy,
      description: `Task "${task.title}" assigned to "${taskId.name}"`,
    });

    console.log("Saved Audit");

    await audit.save();
    res.status(200).json({
      message: "Users assigned to task successfully",
      task,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while assigning users",
      error: error.message,
    });
  }
};

const mongoose = require("mongoose");

exports.unassignUsersFromTask = async (req, res) => {
  try {
    const { taskId, userIds } = req.body;

    // Validate Task ID
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    // Validate User IDs
    if (
      !Array.isArray(userIds) ||
      !userIds.every((id) => mongoose.Types.ObjectId.isValid(id))
    ) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Find the Task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Ensure the `assignedTo` array contains users to unassign
    const usersToRemove = userIds.filter((id) =>
      task.assignedTo.map((user) => user.toString()).includes(id)
    );

    if (usersToRemove.length === 0) {
      return res
        .status(400)
        .json({ message: "None of the users are assigned to this task" });
    }

    // Remove the users
    task.assignedTo = task.assignedTo.filter(
      (id) => !usersToRemove.includes(id.toString())
    );

    const audit = new Audit({
      actionType: "remove",
      model: "Task",
      documentId: task.createdBy,
      userId: task.createdBy,
      description: `Task "${task.title}" unassigned to "${taskId.name}"`,
    });

    console.log("Saved Audit");

    await audit.save();

    // Save the task
    await task.save();

    const message = `You have been removed form task: '${task.title}'`;
    const io = getSocket();

    // Emit task assignment notification to all connected users
    io.emit("taskUnAssigned", {
      message: message,
      taskId: task._id,
      taskTitle: task.title,
    });

    // Emit real-time assignment notification to the assigned users
    userIds.forEach((userId) => {
      io.to(userId).emit("taskUnAssigned", {
        message: message,
        taskId: task._id,
        taskTitle: task.title,
      });
    });

    // Respond with success
    return res.status(200).json({
      message: "Users unassigned successfully",
      task: {
        id: task._id,
        title: task.title,
        assignedTo: task.assignedTo,
        status: task.status,
      },
    });
  } catch (error) {
    console.error("Error unassigning users:", error.message);
    return res.status(500).json({
      message: "An error occurred while unassigning users",
      error: error.message,
    });
  }
};
