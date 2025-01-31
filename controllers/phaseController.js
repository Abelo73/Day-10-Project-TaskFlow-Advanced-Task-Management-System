const Team = require("../models/Team");
const Project = require("../models/Project");
const Phase = require("../models/Phase");

// Create a new team
exports.createTeam = async (req, res) => {
  try {
    const { name, members, projects, phases } = req.body;
    const createdBy = req.user.id; 

    const team = new Team({
      name,
      members,
      projects,
      phases,
      createdBy,
    });

    await team.save();
    res.status(201).json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all teams
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate(
      "members projects phases createdBy"
    );
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
