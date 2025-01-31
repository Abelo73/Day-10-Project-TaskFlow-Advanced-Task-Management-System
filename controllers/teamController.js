const mongoose = require("mongoose"); // Import mongoose
const Team = require("../models/Team");
const Project = require("../models/Project");
const Phase = require("../models/Phase");

// // Creating a new team
// exports.createTeam = async (req, res) => {
//   try {
//     const { name, members, projects, phases } = req.body;
//     const createdBy = req.user._id; // Assuming this comes from an authenticated user

//     if (!name || !members || !projects || !phases || !createdBy) {
//       return res.status(400).json({
//         message: "Please fill all the fields",
//         status: false,
//       });
//     }

//     // Create a new team
//     const team = new Team({
//       name,
//       members: members.map((id) => new mongoose.Types.ObjectId(id)), // Mapping for members
//       projects: projects.map((id) => new mongoose.Types.ObjectId(id)), // Mapping for projects
//       phases: phases.map((id) => new mongoose.Types.ObjectId(id)), // Mapping for phases
//       createdBy: new mongoose.Types.ObjectId(createdBy), // createdBy should be an ObjectId
//     });

//     // Save the team
//     await team.save();

//     // Send success response
//     res.status(201).json({
//       message: "Team created successfully",
//       status: true,
//       data: team,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: `Error creating team: ${error.message}`,
//       status: false,
//     });
//   }
// // };

// // Helper function to check if the provided ID is valid
// const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// // Creating a new team
// exports.createTeam = async (req, res) => {
//   try {
//     const { name, members, projects, phases } = req.body;
//     const createdBy = req.user._id; // Assuming this comes from an authenticated user

//     // Check if any required fields are missing
//     if (!name || !members || !projects || !phases || !createdBy) {
//       return res.status(400).json({
//         message: "Please fill all the fields",
//         status: false,
//       });
//     }

//     // Validate ObjectId format for each member, project, and phase
//     if (
//       !members.every((id) => isValidObjectId(id)) ||
//       !projects.every((id) => isValidObjectId(id)) ||
//       !phases.every((id) => isValidObjectId(id))
//     ) {
//       return res.status(400).json({
//         message: "Invalid ObjectId format for one or more fields",
//         status: false,
//       });
//     }

//     // Create a new team
//     const team = new Team({
//       name,
//       members: members.map((id) => new mongoose.Types.ObjectId(id)), // Mapping for members
//       projects: projects.map((id) => new mongoose.Types.ObjectId(id)), // Mapping for projects
//       phases: phases.map((id) => new mongoose.Types.ObjectId(id)), // Mapping for phases
//       createdBy: new mongoose.Types.ObjectId(createdBy), // createdBy should be an ObjectId
//     });

//     // Save the team
//     await team.save();

//     // Send success response
//     res.status(201).json({
//       message: "Team created successfully",
//       status: true,
//       data: team,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: `Error creating team: ${error.message}`,
//       status: false,
//     });
//   }
// };

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.createTeam = async (req, res) => {
  try {
    const { name, members, projects = [], phases = [] } = req.body;
    const createdBy = req.user._id;

    // Validate required fields
    if (!name || !members || !createdBy) {
      return res.status(400).json({
        message: "Name, members, and createdBy are required fields",
        status: false,
      });
    }

    // Validate ObjectIDs
    const invalidIds = [
      ...members.filter((id) => !isValidObjectId(id)),
      ...projects.filter((id) => !isValidObjectId(id)),
      ...phases.filter((id) => !isValidObjectId(id)),
      !isValidObjectId(createdBy),
    ].filter(Boolean);

    if (invalidIds.length > 0) {
      return res.status(400).json({
        message: "Invalid ID format detected",
        status: false,
        invalidIds,
      });
    }

    // Create team
    const team = await Team.create({
      name,
      members,
      projects,
      phases,
      createdBy,
    });

    res.status(201).json({
      message: "Team created successfully",
      status: true,
      data: team,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error creating team: ${error.message}`,
      status: false,
    });
  }
};

// Get all teams
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("members", "name email")
      .populate("projects", "name status")
      .populate("phases", "name")
      .populate("createdBy", "name");

    res.status(200).json({ success: true, data: teams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single team by ID
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate(
      "members projects phases createdBy"
    );
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    res.status(200).json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a team
exports.updateTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("members projects phases");

    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    res.status(200).json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add a member to a team
exports.addMemberToTeam = async (req, res) => {
  try {
    const teamId = req.params.id; // Team ID from the URL
    const { memberId } = req.body; // Member ID to be added

    // Check if the member ID is valid
    if (!isValidObjectId(memberId)) {
      return res.status(400).json({
        message: "Invalid member ID format",
        status: false,
      });
    }

    // Find the team
    const team = await Team.findById(teamId);
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    // Check if the member already exists in the team
    if (team.members.includes(memberId)) {
      return res.status(400).json({
        message: "This member is already part of the team",
        status: false,
      });
    }

    // Add the member to the team's members list
    team.members.push(memberId);
    await team.save();

    res.status(200).json({
      message: "Member added to team successfully",
      status: true,
      data: team,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error adding member to team: ${error.message}`,
      status: false,
    });
  }
};

// Remove a member from a team
exports.removeMemberFromTeam = async (req, res) => {
  try {
    const teamId = req.params.id; // Team ID from the URL
    const { memberId } = req.body; // Member ID to be removed

    // Check if the member ID is valid
    if (!isValidObjectId(memberId)) {
      return res.status(400).json({
        message: "Invalid member ID format",
        status: false,
      });
    }

    // Find the team
    const team = await Team.findById(teamId);
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    // Check if the member exists in the team
    if (!team.members.includes(memberId)) {
      return res.status(400).json({
        message: "This member is not part of the team",
        status: false,
      });
    }

    // Remove the member from the team's members list
    team.members = team.members.filter((id) => !id.equals(memberId));
    await team.save();

    res.status(200).json({
      message: "Member removed from team successfully",
      status: true,
      data: team,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error removing member from team: ${error.message}`,
      status: false,
    });
  }
};

// Add a project to a team
exports.addProjectToTeam = async (req, res) => {
  try {
    const teamId = req.params.id; // Team ID from the URL
    const { projectId } = req.body; // Project ID to be added

    // Check if the project ID is valid
    if (!isValidObjectId(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID format",
        status: false,
      });
    }

    // Step 1: Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
        status: false,
      });
    }

    // Step 2: Check if the project is already assigned to another team
    const existingTeam = await Team.findOne({ projects: projectId });
    if (existingTeam) {
      return res.status(400).json({
        message: "This project is already assigned to another team",
        status: false,
      });
    }

    // Find the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    // Add the project to the team's projects list
    team.projects.push(projectId);
    await team.save();

    res.status(200).json({
      message: "Project added to team successfully",
      status: true,
      data: team,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error adding project to team: ${error.message}`,
      status: false,
    });
  }
};
// Remove a project from a team
exports.removeProjectFromTeam = async (req, res) => {
  try {
    const teamId = req.params.id; // Team ID from the URL
    const { projectId } = req.body; // Project ID to be removed

    // Check if the project ID is valid
    if (!isValidObjectId(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID format",
        status: false,
      });
    }

    // Find the team
    const team = await Team.findById(teamId);
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    // Check if the project exists in the team's projects
    if (!team.projects.includes(projectId)) {
      return res.status(400).json({
        message: "This project is not part of the team",
        status: false,
      });
    }

    // Remove the project from the team's projects list
    team.projects = team.projects.filter((id) => !id.equals(projectId));
    await team.save();

    res.status(200).json({
      message: "Project removed from team successfully",
      status: true,
      data: team,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error removing project from team: ${error.message}`,
      status: false,
    });
  }
};

// Soft delete a team
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    res
      .status(200)
      .json({ success: true, message: "Team deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
