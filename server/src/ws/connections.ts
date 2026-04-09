import { WebSocket } from "ws";
import type { IncomingMessage } from "http";
import { handleMessage } from "./handlers/message.js";
import { ORIGINS } from "../constants/ws.js";
import { checkAuth } from "../lib/auth.js";
import { rateLimit } from "../middlewares/rateLimit.js";
import { heartBeat } from "../utils/heartBeat.js";

export function handleConnection(ws: WebSocket, req: IncomingMessage) {
  // * origin check <===============>
  const origin = req.headers.origin;

  if (!origin || !ORIGINS.includes(origin)) {
    console.log(`Not allowed this origin ${origin}`);

    ws.terminate();
  } // * <=============>

  const auth = checkAuth(ws, req); // * AUTH CHECK <=================>
  if (!auth) return;

  (ws as any).auth = auth;

  const ip = ((req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket.remoteAddress) as string;
  console.log(ip);

  ws.on("message", (raw) => {
    const res = rateLimit(ws, ip);
    if (!res) return;

    handleMessage(ws, raw); // * messaage handler, check message and give format
  });

  ws.on("pong", heartBeat);

  ws.on("close", () => {
    console.log("Client disconnected");
  });
}
