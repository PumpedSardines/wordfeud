import express from "express";
import { Server } from "socket.io";
import http from "http";

import bodyParser from "body-parser";
import cors from "cors";

/**
 * Express app
 */
const app = express();
/**
 * HTTP server
 */
const server = http.createServer(app);
/**
 * Socket.io server
 */
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(bodyParser.json());

export { app, io, server };
