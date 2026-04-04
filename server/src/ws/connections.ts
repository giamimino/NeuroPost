import { WebSocket } from "ws";
import { handleMessage } from "./handlers/message.js";
import { MAX_MESSAGES_PER_SECOND, ORIGINS } from "../constants/ws.js";
import type { IncomingMessage } from "http";
import { checkAuth } from "../lib/auth.js";

export function handleConnection(ws: WebSocket, req: IncomingMessage) {
  // * origin check <===============>
  const origin = req.headers.origin;
  
  if (!origin || !ORIGINS.includes(origin)) {
    console.log(`Not allowed this origin ${origin}`);

    ws.terminate();
  } // * <=============>


  const isAuth = checkAuth(ws, req) // * AUTH CHECK <=================>
  if(!isAuth) return

  // * messages rate limit <==========>
  let messageCount = 0;

  setInterval(() => (messageCount = 0), 1000);

  ws.on("message", (raw) => {
    messageCount++;

    if (messageCount > MAX_MESSAGES_PER_SECOND) {
      ws.terminate();
      return;
    }
    // * <==================>

    handleMessage(ws, raw); // * messaage handler, check message and give format
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.send("Welcome");
}
