import { Server as SocketIOServer } from "socket.io";
const express = require("express");
const { createServer } = require("node:http");

const app = express();
const server = createServer(app);

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let rooms = {}; // Store rooms

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("create_room", (room) => {
    socket.join(room);
    rooms[room] = rooms[room] || [];
    rooms[room].push(socket.id);
    console.log(`${socket.id} joined room ${room}`);
  });

  socket.on("send_message", ({ room, message }) => {
    io.to(room).emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
