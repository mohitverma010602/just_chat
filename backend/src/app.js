import express from "express";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import { WebSocketServer } from "ws";
import authRouter from "./routes/userAuth.routes.js";

const app = express();
const server = http.createServer(app); // Use http.Server to support both HTTP and WebSocket
const wss = new WebSocketServer({ server }); // Attach WebSocket server to the same HTTP server

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/just-chat/api/v1/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Hello from just_chat");
});

// Handle WebSocket connection
wss.on("connection", (ws) => {
  console.log("Client connected");

  // Send a welcome message to the client
  ws.send("Welcome to the WebSocket server!");

  // Handle incoming messages from the client
  ws.on("message", (message) => {
    const messageStr = message.toString();
    console.log("Received:", messageStr);

    // Broadcast message to all clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === ws.OPEN) {
        client.send(`Broadcast: ${messageStr}`);
      }
    });
  });

  // Handle client disconnecting
  ws.on("close", () => {
    console.log("Client disconnected");
  });

  // Handle WebSocket errors
  ws.on("error", (error) => {
    console.log("WebSocket error:", error);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

export { app };
