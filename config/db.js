const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGO_URI;

const connectDB = () => {
  try {
    mongoose.connect(uri).then(() => console.log("MongoDB connected"));
  } catch (error) {
    console.log("MongoDB Not connected, ", error);
  }
};

module.exports = connectDB;
