const Audit = require("../models/Audit");

exports.getAllAudits = async (req, res) => {
  try {
    // Fetch all audits from the database
    const audits = await Audit.find().populate("userId", "username"); // Populate user info (e.g., username)
    if (!audits) {
      return res.status(404).json({ message: "No audits found" });
    }
    console.log("Audits: ", audits);

    res.status(200).json({
      success: true,
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
