import { MAX_MESSAGES_PER_SECOND } from "@/constants/ws";
import { WebSocket } from "ws";
import { handleMessage } from "./handlers";


export function handleConnection(ws: WebSocket) {
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