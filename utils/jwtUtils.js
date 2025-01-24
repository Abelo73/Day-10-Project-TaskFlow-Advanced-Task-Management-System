const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.SECRET_KEY;

// Generate JWT token

const generateToken = (userId) => {
  const payload = { userId };
  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
};

// Validate Token

const validateToken = (token) => {
  try {
    jwt.verify(token, secretKey);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// Extract User from Token

const extractUserId = (token) => {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, validateToken, extractUserId };
