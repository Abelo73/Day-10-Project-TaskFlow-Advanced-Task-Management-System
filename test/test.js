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

// Handle errors
socket.on("connect_error", (error) => {
  console.log("Connection failed:", error);
});
