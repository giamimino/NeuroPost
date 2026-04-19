import { WebSocket } from "ws";
import type { IncomingMessage } from "http";
import { handleMessage } from "./handlers/message.js";
import { ORIGINS } from "../constants/ws.js";
import { checkAuth } from "../lib/auth.js";
import { rateLimit } from "../middlewares/rateLimit.js";
import { heartBeat } from "../utils/heartBeat.js";
import { UserSchema } from "../schemas/user.schema.js";
import { WS } from "../types/ws.types.js";

export function handleConnection(ws: WS, req: IncomingMessage) {
  // * origin check <===============>
  const origin = req.headers.origin;

  if (!origin || !ORIGINS.includes(origin)) {
    console.log(`Not allowed this origin ${origin}`);

    ws.terminate();
  } // * <=============>

  const auth = checkAuth(ws, req); // * AUTH CHECK <=================>
  if (!auth) return;

  const result = UserSchema.safeParse(auth);

  if (result.error || !result.data || result.data.status !== "active") {
    ws.terminate();
    return;
  }

  ws.auth = result.data;

  const ip = ((req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket.remoteAddress) as string;

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
