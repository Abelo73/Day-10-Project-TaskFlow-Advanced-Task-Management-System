const jwt = require("jsonwebtoken");
const TaskUser = require("../models/User");
require("dotenv").config();

const authenticateUser = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  const secretKey = process.env.ACCESS_TOKEN_SECRET;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);

    // Log decoded token
    console.log("Decoded Token:", decoded);

    // Find user by ID (and accessToken if applicable)
    const user = await TaskUser.findById(decoded.userId).populate("role");

    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found or token expired" });
    }

    console.log("Authenticated User:", user);

    req.user = user;
    next();
  } catch (err) {
    console.error("Authentication Error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticateUser;
