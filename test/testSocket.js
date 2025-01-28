const { io } = require("socket.io-client");

const socket = io("http://localhost:8080"); // Replace with your server URL

// Listen for task creation event
socket.on("taskCreated", (task) => {
  console.log("Task Created Event:", task);
});

// Listen for task assignment event
socket.on("taskAssigned", (taskData) => {
  console.log("Task Assigned Event:", taskData);
});

// Listen for task unassignment event
socket.on("taskUnassigned", (taskData) => {
  console.log("Task Unassigned Event:", taskData);
});

socket.on("connect", () => {
  console.log("Connected to Socket.IO server!");
});

socket.on("receiveMessage", (message) => {
  console.log("Message from server:", message);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server!");
});
