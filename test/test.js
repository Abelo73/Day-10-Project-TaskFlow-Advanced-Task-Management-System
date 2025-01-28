// test.js
const io = require("socket.io-client"); // Make sure this is installed
const socket = io("http://localhost:8080"); // Make sure the URL matches your socket server

socket.on("connect", () => {
  console.log("Connected to the server!");
});

// Listen for taskNotification event
socket.on("taskNotification", (task) => {
  console.log("Received task notification:", task);
});

socket.on("taskAssigned", (task) => {
  console.log("Task assigned:", task);
});

socket.on("taskUnAssigned", (task) => {
  console.log("Task unassigned:", task);
});

// Project Notifications
socket.on("projectNotification", (project) => {
  console.log("Received project notification:", project);
});

socket.on("ProjectAssignment", (project) => {
  console.log("Project assigned:", project);
});

socket.on("ProjectRemoval", (project) => {
  console.log("Received Project removal", project);
});

// Handle errors
socket.on("connect_error", (error) => {
  console.log("Connection failed:", error);
});
