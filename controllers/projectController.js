const mongoose = require("mongoose");

const Project = require("../models/Project");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// exports.createProject = async (req, res) => {
//   try {
//     const { name, description, startDate, endDate, members } = req.body;
//     const project = new Project({
//       name,
//       description,
//       startDate,
//       endDate,
//       members, // Assign the members to the project
//       createdBy: req.user._id, // Assuming req.user is populated with the authenticated user
//     });

//     await project.save();
//     res.status(201).json({
//       message: "Project created successfully",
//       project: project,
//     });
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: "Error creating project", error: error.message });
//   }
// };
exports.createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, members } = req.body;

    // Validate each member ID to be a valid ObjectId
    if (
      members.some((memberId) => !mongoose.Types.ObjectId.isValid(memberId))
    ) {
      return res.status(400).json({
        message: "Invalid user ID format in members field",
      });
    }

    // Convert members to valid ObjectId
    const memberObjectIds = members.map(
      (memberId) => new mongoose.Types.ObjectId(memberId)
    );

    // Create the project
    const project = new Project({
      name,
      description,
      startDate,
      endDate,
      members: memberObjectIds, // Ensure the members are valid ObjectIds
      createdBy: req.user._id, // Assuming req.user is populated with the authenticated user
    });

    // Save the project
    await project.save();

    res.status(201).json({
      message: "Project created successfully",
      project: project,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error creating project",
      error: error.message,
    });
  }
};

exports.addMemberToProject = async (req, res) => {
  try {
    const { projectId, userId } = req.body;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Add member to project members array
    if (!project.members.includes(userId)) {
      project.members.push(userId);
      await project.save();
      res.status(200).json({ message: "User added to project", project });
    } else {
      res
        .status(400)
        .json({ message: "User is already a member of this project" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding member", error: error.message });
  }
};

exports.removeMemberFromProject = async (req, res) => {
  try {
    const { projectId, userId } = req.body;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Remove member from project members array
    const index = project.members.indexOf(userId);
    if (index > -1) {
      project.members.splice(index, 1);
      await project.save();
      res.status(200).json({ message: "User removed from project", project });
    } else {
      res.status(400).json({ message: "User is not a member of this project" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing member", error: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("members");
    res.status(200).json({
      message: "Projects retrieved successfully",
      data: projects,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting projects", error: error.message });
  }
};
