
import { WebSocket } from "ws";
import { handleMessage } from "./handlers.js";
import { MAX_MESSAGES_PER_SECOND, ORIGINS } from "../constants/ws.js";
import type { IncomingMessage } from "http";

export function handleConnection(ws: WebSocket, req: IncomingMessage) {
  const origin = req.headers.origin
  if(!origin || !ORIGINS.includes(origin)) {
    console.log(`Not allowed this origin ${origin}`);
    
    ws.terminate()
  }
  
  let messageCount = 0

  setInterval(() => messageCount = 0, 1000)

  ws.on("message", (raw) => {
    messageCount++;

    if(messageCount > MAX_MESSAGES_PER_SECOND) {
      ws.terminate()
      return
    }
    
    handleMessage(ws, raw)
  })

  ws.on("close", () => {
    console.log("Client disconnected")
  })

  ws.send("Welcome")
}