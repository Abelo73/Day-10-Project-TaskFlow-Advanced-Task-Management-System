require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const connectDB = require("./config/db");
const userRoutes = require("./routers/userRoutes");

// middlewares

app.use(express.json());

app.use(morgan("dev"));

// Routes

connectDB();

app.use("/api/auth", userRoutes);

app.get("/api/task", (req, res) => {
  res.json({
    message: "API for task is running",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
