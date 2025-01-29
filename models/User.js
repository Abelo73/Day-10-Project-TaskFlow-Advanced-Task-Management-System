const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const AccessControl = require("./AccessControl");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: [true, "Email already exists"],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: true,
    },
    // role: {
    //   type: String,
    //   enum: ["USER", "ADMIN", "MANAGER", "MEMBER", "GUEST"],
    //   default: "GUEST",
    // },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccessControl",
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpiry: {
      type: Date,
    },
    otp: {
      type: Number,
    },
    otpExpiry: {
      type: Date,
    },
    accessToken: {
      type: String,
    },
    accessTokenExpiry: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
    refreshTokenExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

// userSchema.pre("save", async function (next) {
//   if (!this.role) {
//     try {
//       // Fetch the "GUEST" role ObjectId from AccessControl collection
//       const guestRole = await AccessControl.findOne({ role: "GUEST" }).select(
//         "_id"
//       );
//       if (guestRole) {
//         this.role = guestRole._id; // Assign the ObjectId of GUEST to the role field
//         console.log("Assigned role:", this.role); // Add logging here for debugging
//       } else {
//         throw new Error("GUEST role not found in AccessControl collection");
//       }
//     } catch (error) {
//       console.log("Error in pre-save hook:", error.message); // Log errors for debugging
//       return next(error);
//     }
//   }
//   next();
// });

// // Hash password before saving
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// // Compare passwords
// userSchema.methods.comparePassword = async function (enteredPassword) {
//   return bcrypt.compare(enteredPassword, this.password);
// };

module.exports = mongoose.model("TaskUser", userSchema);
