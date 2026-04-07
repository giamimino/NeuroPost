import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type { IncomingMessage } from "http";
import type WebSocket from "ws";
import cookie from "cookie"
import { ERRORS } from "../constants/errors.js";

dotenv.config();

export function verifyToken(token: string) {
  return jwt.verify(token, process.env.ACCESS_SECRET!);
}
export function checkAuth(ws: WebSocket, req: IncomingMessage) {
  const cookiesHeader = req.headers.cookie

  if(!cookiesHeader) {
    ws.close(401, JSON.stringify({ error: ERRORS.UNAUTHORIZED }))
    return
  }

  const cookies = cookie.parse(cookiesHeader)
  const token = cookies[process.env.ACCESS_COOKIE_NAME!]

  if (!token) {
    ws.close(401, JSON.stringify({ error: ERRORS.UNAUTHORIZED }));
    return false
  }

  try {
    verifyToken(token);
    return true;
  } catch (error) {
    ws.close(401, JSON.stringify({ error: ERRORS.INVALID_CREDENTIALS }));
  }
}
