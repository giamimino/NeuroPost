import { ERRORS } from "src/constants/errors";
import { MAX_MESSAGES_PER_SECOND, RATE_LIMIT_WINDOW } from "src/constants/ws";
import type { WebSocket } from "ws";

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
