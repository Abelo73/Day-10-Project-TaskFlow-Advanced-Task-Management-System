const express = require("express");
const TaskUser = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/passwordUtils");
const { sendEmail } = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const router = express.Router();

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

// // Register a new user
// router.post("/", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password) {
//       return res.status(400).json({
//         message: "Please fill in all fields",
//         status: false,
//       });
//     }

//     // Check email is already used or not

//     const existingUser = await TaskUser.findOne({ email });

//     if (existingUser) {
//       return res.status(400).json({
//         message: "Email already in use",
//         status: false,
//       });
//     }

//     // Hash password
//     const hashedPassword = await hashPassword(password);
//     const user = new TaskUser({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     // Save user to database
//     await user.save();

//     // Generate a JWT token for email verification

//     const verificationToken = jwt.sign(
//       { email },
//       process.env.ACCESS_TOKEN_SECRET,
//       { expiresIn: "1h" }
//     );
//     console.log("Email verification token: ", verificationToken);

//     const verificationTokenExpiry = new Date(Date.now()+ 60 *60 *1000) //
//     // verificationLink

//     const verificationLink = `${req.protocol}://${req.get("host")}/api/auth/verify?token=${verificationToken}`;

//     // const verificationLink = "http://localhost:8080/api/auth";
//     // const verificationLink = `${req.protocol}://${req.get("host")}/api/auth`;

//     // send email to user to verify email
//     await sendEmail(
//       email,
//       "Verify your email",
//       `Please click on this link to verify your email: ${verificationLink}`
//     );

//     // await sendEmail({
//     //   to: email,
//     //   subject: "Verify your email",
//     //   text: `Please click on this link to verify your email: ${verificationLink}`,
//     // });
//     console.log(
//       `Please click on the link to verify your email: ${verificationLink}`
//     );
//     res.status(201).json({
//       message: "User created successfully. Verify your email.",
//       status: true,
//       data: user,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message, status: false });
//   }
// });

// Register a new user
router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;

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
      verificationToken,
      verificationTokenExpiry,
    });

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
      data: { id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
});

// // Email verification endpoint using GET
// router.get("/verify", async (req, res) => {
//   const { token } = req.query; // Use req.query to get the token from query params

//   if (!token) {
//     return res
//       .status(400)
//       .json({ message: "Token is required", status: false });
//   }

//   try {
//     // Decode the token to get the email
//     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

//     // Check if the token is still valid (if it hasn't expired)
//     const user = await TaskUser.findOne({
//       email: decoded.email,
//       verificationToken: token, // Ensure token matches what is stored
//       verificationTokenExpiry: { $gte: new Date() }, // Check token expiry
//     });

//     if (!user) {
//       return res.status(404).json({
//         message: "Invalid or expired verification token",
//         status: false,
//       });
//     }

//     // Check if the user is already verified
//     if (user.isVerified) {
//       return res.status(200).json({
//         message: "Your email is already verified",
//         status: true,
//       });
//     }

//     // Token is valid, update the user's verified status
//     user.isVerified = true;
//     // user.verificationToken = null; // Clear the token after verification
//     user.verificationTokenExpiry = null; // Clear the expiry
//     await user.save(); // Save the updated user status

//     await sendEmail(
//       email,
//       "Email verified successfully",
//       `You have been successfully verified your email. Thanks for our Task Management System.`
//     );

//     // Send a success message (this could also be a redirect in a real app)
//     res.status(200).json({
//       message: "Email verified successfully",
//       status: true,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Invalid token", status: false });
//   }
// });

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

// Login with password, email, and confirmPassword
router.post("/login", async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  console.log("Login requests: ", email, password);
  try {
    // input validation

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        message: "Please provide all required fields",
        status: false,
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
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
    if (!user.isVerified) {
      return res.status(400).json({
        message: "Email is not verified",
        status: false,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // Login success
    res.status(200).json({
      message: "Login successful",
      status: true,
      token: token,
    });

    // Check if the email and password match
  } catch (error) {
    res.status(500).json({
      message: `Error while login, ${error.message}`,
      status: false,
    });
  }
});

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
