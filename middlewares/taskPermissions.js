exports.checkTaskOwnership = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task.createdBy.equals(req.user.id) && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Authorization check failed" });
  }
};
