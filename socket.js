const socketIo = require("socket.io");

let io;

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*", // Replace '*' with your frontend URL in production
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token === process.env.SECRET_TOKEN) {
      next();
    } else {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Joining rooms (e.g., for projects or user-specific tasks)
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Handle task updates and broadcast to the room
    socket.on("taskUpdated", (data) => {
      const { roomId, task } = data;
      io.to(roomId).emit("taskNotification", task);
    });

    // Example message handler
    socket.on("sendMessage", (message) => {
      console.log("Message received:", message);
      io.emit("receiveMessage", message); // Broadcast to all connected clients
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = { initializeSocket, getSocket: () => io };
