const express = require("express");
const Task = require("../models/Task");
const { hashPassword, comparePassword } = require("../utils/passwordUtils");
const { sendEmail } = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require("bcryptjs");

// Get all tasks

router.get("/", async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({
      message: `Error while fetching tasks. ${error.message}`,
      status:false
    });
  }
});
