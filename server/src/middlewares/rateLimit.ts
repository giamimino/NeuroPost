import type { WebSocket } from "ws";
import { MAX_MESSAGES_PER_SECOND, RATE_LIMIT_WINDOW } from "../constants/ws.js";
import { ERRORS } from "../constants/errors.js";

const rateLimits = new Map<string, number[]>();

export function rateLimit(ws: WebSocket, ip: string) {
  if (!rateLimits.has(ip)) {
    rateLimits.set(ip, []);
  }

  const currentDate = Date.now();

  const timestampts = rateLimits
    .get(ip)!
    .filter((ts) => currentDate - ts < RATE_LIMIT_WINDOW);

  if (timestampts.length > MAX_MESSAGES_PER_SECOND) {
    ws.send(JSON.stringify({ error: ERRORS.LIMIT_EXCEEDED }));
    return false
  }

  timestampts.push(currentDate)
  rateLimits.set(ip, timestampts)
}
