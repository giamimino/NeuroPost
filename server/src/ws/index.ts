import { WebSocketServer } from "ws";
import { handleConnection } from "./connections.js";

export function createWebSocketServer(port: number) {
  const wss = new WebSocketServer({
    port,
    perMessageDeflate: {
      zlibDeflateOptions: {
        chunkSize: 1024,
        memLevel: 7,
        level: 3,
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024,
      },
      clientNoContextTakeover: true,
      serverNoContextTakeover: true,
      serverMaxWindowBits: 10,
      concurrencyLimit: 10,
      threshold: 1024,
    },
    maxPayload: 1024 * 1024,
  });

  wss.on("connection", (ws, req) => {
    handleConnection(ws, req);
  });

  return wss;
}
