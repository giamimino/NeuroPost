import dotenv from "dotenv";
import { createWebSocketServer } from "./ws/index.js";
import "./workers/searchIndex.worker.js"

dotenv.config();

const port = Number(process.env.PORT) || 3001;

createWebSocketServer(port);

console.log(`WebSocket server running on port ${port}`);
