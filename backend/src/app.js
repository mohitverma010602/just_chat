import express from "express";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import { WebSocketServer } from "ws";
import authRouter from "./routes/userAuth.routes.js";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes
//Auth Routes
app.use("/just-chat/api/v1/auth", authRouter);

app.get("/", (req, res) => {
  res.send("hello from just_chat");
});

wss.on("connection", (ws) => {
  console.log("A user connected");
  ws.on("message", (message) => {
    console.log("Received message: " + message);
  });
  ws.on("close", () => {
    console.log("User disconnected");
  });
});

export { app };
