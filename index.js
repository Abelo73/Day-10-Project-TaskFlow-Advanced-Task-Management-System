require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { initializeSocket } = require("./socket");
const connectDB = require("./config/db");
const userRoutes = require("./routers/userRoutes");
const taskRoutes = require("./routers/taskRoutes");
const notificationRoutes = require("./routers/notificationRoutes");
const projectRoutes = require("./routers/projectRoutes");
const auditRoutes = require("./routers/auditRoutes");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
app.use(helmet());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
});
app.use("/api/", apiLimiter);

// Database Connection
connectDB();

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/audits", auditRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || "Internal Server Error",
      status: statusCode,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    },
  });
});

// Initialize Socket.IO
initializeSocket(server);

// Start the Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
