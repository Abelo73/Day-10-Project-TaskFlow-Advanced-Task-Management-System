const mongoose = require("mongoose");

const Project = require("../models/Project");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// exports.addMemberToProject = async (req, res) => {
//   try {
//     const { projectId, userId } = req.body;

//     // Validate projectId and userId as ObjectId
//     if (
//       !mongoose.Types.ObjectId.isValid(projectId) ||
//       !mongoose.Types.ObjectId.isValid(userId)
//     ) {
//       return res.status(400).json({ message: "Invalid projectId or userId" });
//     }

//     const project = await Project.findById(projectId);

//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     // Check if the user is already a member
//     if (!project.members.includes(userId)) {
//       project.members.push(new mongoose.Types.ObjectId(userId)); // Use `new mongoose.Types.ObjectId`
//       await project.save();
//       res.status(200).json({ message: "User added to project", project });
//     } else {
//       res
//         .status(400)
//         .json({ message: "User is already a member of this project" });
//     }
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error adding member", error: error.message });
//   }
// };

// exports.addMemberToProject = async (req, res) => {
//   try {
//     const { projectId, userId } = req.body;
//     const project = await Project.findById(projectId);

//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     // Add member to project members array
//     if (!project.members.includes(userId)) {
//       project.members.push(userId);
//       await project.save();
//       res.status(200).json({ message: "User added to project", project });
//     } else {
//       res
//         .status(400)
//         .json({ message: "User is already a member of this project" });
//     }
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error adding member", error: error.message });
//   }
// };

// exports.addMemberToProject = async (req, res) => {
//   try {
//     const { projectId, userId } = req.body;

//     // Validate projectId and userId as ObjectId
//     if (
//       !mongoose.Types.ObjectId.isValid(projectId) ||
//       !mongoose.Types.ObjectId.isValid(userId)
//     ) {
//       return res.status(400).json({ message: "Invalid projectId or userId" });
//     }

//     const project = await Project.findById(projectId);

//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     // Check if the user is already a member
//     if (!project.members.includes(userId)) {
//       project.members.push(mongoose.Types.ObjectId(userId)); // Cast userId to ObjectId
//       await project.save();
//       res.status(200).json({ message: "User added to project", project });
//     } else {
//       res
//         .status(400)
//         .json({ message: "User is already a member of this project" });
//     }
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error adding member", error: error.message });
//   }
// };

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
