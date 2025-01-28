// test/socket.test.js
import { expect } from "chai";
import supertest from "supertest";
import http from "http";
import socketIo from "socket.io";
import { initializeSocket } from "../socket";
import app from "../server"; // Import your Express app
import Task from "../models/Task"; // Assuming your Task model is here
import socketClient from "socket.io-client"; // Importing socket.io-client

const request = supertest(app);

describe("Task Controller and Socket.IO Notifications", function () {
  let io, server, socketClientInstance;
  const roomId = "testRoom";

  before((done) => {
    // Initialize the server and Socket.IO
    server = http.createServer(app);
    io = socketIo(server);
    initializeSocket(server);

    // Setting up the mock socket client to simulate connection
    socketClientInstance = socketClient("http://localhost:8080");

    socketClientInstance.on("connect", done); // Wait until connected to proceed
  });

  after((done) => {
    socketClientInstance.disconnect();
    server.close(done);
  });

  it("should create a task and emit a taskNotification event", (done) => {
    const taskData = {
      title: "Complete Project Report | Test",
      description:
        "Write and complete the final report for the project to show its working when task is created or assigned",
      assignedTo: ["6797322e3766ab22f904ee05"], // Valid ObjectId format
      priority: "HIGH",
      dueDate: "2025-01-30T00:00:00.000Z",
      createdBy: "67935534f772432c52ed2822", // Valid ObjectId format
      roomId: roomId,
    };

    // Emit socket event when the task is created
    socketClientInstance.on("taskNotification", (task) => {
      expect(task).to.have.property("title", "Complete Project Report | Test");
      expect(task).to.have.property(
        "description",
        "Write and complete the final report for the project to show its working when task is created or assigned"
      );
      expect(task).to.have.property("priority", "HIGH");
      expect(new Date(task.dueDate).toISOString()).to.equal(
        "2025-01-30T00:00:00.000Z"
      );
      expect(task)
        .to.have.property("assignedTo")
        .that.is.an("array")
        .that.includes("6797322e3766ab22f904ee05");
      expect(task).to.have.property("createdBy", "67935534f772432c52ed2822");
      done();
    });

    // Make an HTTP request to create a task
    request
      .post("/api/tasks/create")
      .send(taskData)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).to.be.true;
        done();
      });
  });

  it("should update a task and emit a taskUpdated event", (done) => {
    const updatedTaskData = {
      taskId: "some_task_id", // Use a valid task ID here
      updatedData: {
        taskName: "Updated Task",
        description: "This is an updated task",
      },
      roomId: roomId,
    };

    // Emit socket event when the task is updated
    socketClientInstance.on("taskUpdated", (data) => {
      expect(data.task).to.have.property("taskName", "Updated Task");
      expect(data.task).to.have.property(
        "description",
        "This is an updated task"
      );
      done();
    });

    // Make an HTTP request to update a task
    request
      .put("/api/tasks/update")
      .send(updatedTaskData)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).to.be.true;
        done();
      });
  });
});
