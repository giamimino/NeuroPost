import { WebSocket } from "ws";
import type { IncomingMessage } from "http";
import { handleMessage } from "./handlers/message.js";
import { ORIGINS } from "../constants/ws.js";
import { checkAuth } from "../lib/auth.js";
import { rateLimit } from "../middlewares/rateLimit.js";

export function handleConnection(ws: WebSocket, req: IncomingMessage) {
  // * origin check <===============>
  const origin = req.headers.origin;

  if (!origin || !ORIGINS.includes(origin)) {
    console.log(`Not allowed this origin ${origin}`);

    ws.terminate();
  } // * <=============>

  const isAuth = checkAuth(ws, req); // * AUTH CHECK <=================>
  if (!isAuth) return;

  const ip = ((req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket.remoteAddress) as string;

  ws.on("message", (raw) => {
    const res = rateLimit(ws, ip);
    if (!res) return;

    handleMessage(ws, raw); // * messaage handler, check message and give format
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.send("Welcome");
}
