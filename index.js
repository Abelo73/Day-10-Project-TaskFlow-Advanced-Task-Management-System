require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const connectDB = require("./config/db");
const userRoutes = require("./routers/userRoutes");
const taskRoutes = require("./routers/taskRoutes");
const notificationRoutes = require("./routers/notificationRoutes");
// middlewares

app.use(express.json());

app.use(morgan("dev"));

// Routes

connectDB();

app.use("/api/auth", userRoutes);

app.use("/api/tasks", taskRoutes);
app.use("/api/notification", notificationRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
