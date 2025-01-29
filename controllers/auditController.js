const Audit = require("../models/Audit");

exports.getAllAudits = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;
    const skip = (page - 1) * limit;
    const sortOrder = order === "asc" ? 1 : -1;

    // Fetch audits from the database with pagination and sorting
    const audits = await Audit.find()
      .populate("userId", "username")
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder });

    const totalAudits = await Audit.countDocuments();

    // Count audits by action type
    const updatedAudits = await Audit.countDocuments({ actionType: "update" });
    const removedAudits = await Audit.countDocuments({ actionType: "remove" });
    const assignedAudits = await Audit.countDocuments({ actionType: "assign" });
    const createdAudits = await Audit.countDocuments({ actionType: "create" });

    // Calculate percentages
    const updatedPercent = (updatedAudits / totalAudits) * 100;
    const removedPercent = (removedAudits / totalAudits) * 100;
    const assignedPercent = (assignedAudits / totalAudits) * 100;
    const createdPercent = (createdAudits / totalAudits) * 100;

    console.log("Audits: ", audits);

    res.status(200).json({
      success: true,
      totalAudits,
      updatedPercent,
      removedPercent,
      assignedPercent,
      createdPercent,
      audits,
    });
  } catch (error) {
    console.error("Error fetching audits:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching audits",
    });
  }
};
