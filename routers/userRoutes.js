const express = require("express");
const TaskUser = require("../models/User");
const AccessControl = require("../models/AccessControl");
const { hashPassword, comparePassword } = require("../utils/passwordUtils");
const { sendEmail } = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require("bcryptjs");

// Get all users

router.get("/", async (req, res) => {
  try {
    const users = await TaskUser.find();

    if (!users) {
      return res.status(404).json({ message: "No users found", status: false });
    }
    res.status(200).json({
      message: "Users fetched successfully",
      status: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
});

// Register a new user
router.post("/", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log("Registration request: ", req.body);

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill in all fields",
        status: false,
      });
    }

    // Check if email is already used
    const existingUser = await TaskUser.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already in use",
        status: false,
      });
    }

    const roleExist = await AccessControl.findOne({ role });
    console.log("Role exist while saving user:", roleExist);
    if (!roleExist) {
      return res.status(400).json({
        message: "Invalid role. Role must exist in AccessControl",
        status: false,
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate a verification token
    const verificationToken = jwt.sign(
      { email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" } // Token valid for 1 hour
    );

    // Set token expiry time (1 hour from now)
    const verificationTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    // Create user object with verificationToken and expiry
    const user = new TaskUser({
      name,
      email,
      password: hashedPassword,
      role: roleExist._id,
      verificationToken,
      verificationTokenExpiry,
    });

    console.log("user: saving with role: ", user);

    // Save user to database
    await user.save();

    // Create verification link
    const verificationLink = `${req.protocol}://${req.get("host")}/api/auth/verify?token=${verificationToken}`;

    // Send email with the verification link
    await sendEmail(
      email,
      "Verify your email",
      `Please click on this link to verify your email: ${verificationLink}`
    );

    console.log(`Verification email sent to: ${email}`);
    console.log(`Verification link: ${verificationLink}`);

    res.status(201).json({
      message: "User registered successfully. Verify your email.",
      status: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
});

// Email verification endpoint using GET
router.get("/verify", async (req, res) => {
  const { token } = req.query; // Use req.query to get the token from query params

  if (!token) {
    return res
      .status(400)
      .json({ message: "Token is required", status: false });
  }

  try {
    // Decode the token to get the email
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Check if the token is still valid (if it hasn't expired)
    const user = await TaskUser.findOne({
      email: decoded.email,
      verificationToken: token, // Ensure token matches what is stored
      verificationTokenExpiry: { $gte: new Date() }, // Check token expiry
    });

    if (!user) {
      return res.status(404).json({
        message: "Invalid or expired verification token",
        status: false,
      });
    }

    // Check if the user is already verified
    if (user.isVerified) {
      return res.status(200).json({
        message: "Your email is already verified",
        status: true,
      });
    }

    // Token is valid, update the user's verified status
    user.isVerified = true;
    user.verificationToken = null; // Clear the token after verification
    user.verificationTokenExpiry = null; // Clear the expiry
    await user.save(); // Save the updated user status

    // Send a success email after verification
    await sendEmail(
      user.email, // Use the user's email to send the verification success email
      "Email verified successfully",
      `You have successfully verified your email. Thanks for using our Task Management System.`
    );

    res.status(200).json({
      message: "Email verified successfully",
      status: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Invalid token", status: false });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login requests: ", email, password);

  try {
    // input validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide both email and password",
        status: false,
      });
    }

    // Find user by email
    const user = await TaskUser.findOne({ email });
    console.log("USER: ", user);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: false,
      });
    }

    // Check if user is verified
    // if (!user.isVerified) {
    //   return res.status(400).json({
    //     message: "Email is not verified",
    //     status: false,
    //   });
    // }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect password",
        status: false,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    // Login success
    res.status(200).json({
      message: "Login successful",
      status: true,
      token: token,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error while login, ${error.message}`,
      status: false,
    });
  }
});

// Filter only verified users

router.get("/verified", async (req, res) => {
  try {
    const users = await TaskUser.find({ isVerified: true });
    console.log("Only verified users filtered, ", users);

    if (!users) {
      return res.status(404).json({
        message: "No verified users found",
        status: false,
      });
    }
    res.status(200).json({
      message: "Verified users fetched successfully",
      status: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error while fetching user, ${error.message}`,
      status: false,
    });
  }
});

// Sending OTP by email
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        status: false,
      });
    }
    const user = await TaskUser.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: `User not found with email: ${email}`,
        status: false,
      });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000); //
    console.log("Generated OTP ", otp);
    const otpExpiry = Date.now() + 15 * 60 * 1000;
    console.log("OTP Expiry, ", otpExpiry);

    // Save OTP and expiry in user document
    user.otp = otp;
    user.otpExpiry = otpExpiry;

    await user.save();

    // Send email with the verification link
    await sendEmail(
      email,
      "Reset password OTP",
      `Your password reset OTP is ${otp} and it will expire in 5 minutes.`
    );
    res.status(200).json({
      message: "OTP sent successfully",
      status: true,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error while sending OTP, ${error.message}`,
      status: false,
    });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
        status: false,
      });
    }

    const user = await TaskUser.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: false,
      });
    }
    // Compare OTP is valid or not expired or not
    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
        status: false,
      });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({
        message: "OTP expired",
        status: false,
      });
    }

    // verify otp success
    await TaskUser.updateOne({ email }, { $set: { otp: "", otpExpiry: "" } });
    res.status(200).json({
      message: "OTP verified successfully",
      status: true,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error while verifying OTP, ${error.message}`,
      status: false,
    });
  }
});

// Change password
router.post("/change-password", async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Email, New Password, and Confirm Password are required",
        status: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New Password and Confirm Password do not match",
        status: false,
      });
    }

    // Find user by email
    const user = await TaskUser.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: false,
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    await TaskUser.updateOne({ email }, { $set: { password: hashedPassword } });

    res.status(200).json({
      message: "Password changed successfully",
      status: true,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error while changing password, ${error.message}`,
      status: false,
    });
  }
});

// Forgot password

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        status: false,
      });
    }
    const user = await TaskUser.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: false,
      });
    }
    const password = Math.floor(100000 + Math.random() * 900000);

    // set password
    const hashedPassword = await bcrypt.hash(password.toString(), 10);
    await TaskUser.updateOne({ email }, { $set: { password: hashedPassword } });

    await sendEmail(
      email,
      "Reset Password",
      `Your new password is: ${password}`
    );
    res.status(200).json({
      message:
        "Temporary password sent successfully, check in your email and login with it",
      status: true,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error while changing password, ${error.message}`,
      status: false,
    });
  }
});
// fetch single user

router.get("/:id", async (req, res) => {
  try {
    const user = await TaskUser.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: false,
      });
    }
    res.status(200).json({
      message: "User fetched successfully",
      status: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error while fetching user, ${error.message}`,
      status: false,
    });
  }
});

// Delete a user

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await TaskUser.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: false,
      });
    }
    res.status(200).json({
      message: "User deleted successfully",
      status: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
});

module.exports = router;
