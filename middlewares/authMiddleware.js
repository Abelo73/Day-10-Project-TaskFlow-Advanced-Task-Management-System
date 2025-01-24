// const { extractUserId, validateToken } = require("../utils/jwtUtils");
const TaskUser = require("../models/User");
require("dotenv").config();
// Middleware to verify JWT and extract the current User

const authenticateUser = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", ""); // Get token from Authorization header
  const secretKey = process.env.ACCESS_TOKEN_SECRET;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify the token and extract user data
    const decoded = jwt.verify(token, secretKey);

    // Find the user by access token
    const user = await TaskUser.findOne({
      _id: decoded.userId,
      accessToken: token,
    });

    console.log("USER from access token: ", user);
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found or token expired" });
    }
    console.log("Authenticated User", user);
    // Attach user data to request object
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { authenticateUser };
