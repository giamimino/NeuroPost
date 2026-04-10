import { WebSocketServer } from "ws";
import { handleConnection } from "./connections.js";
import { WS } from "../types/ws.types.js";

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

  const interval = setInterval(() => {
    wss.clients.forEach((client: WS) => {
      if (client.isAlive === false) {
        console.log("terminate");

        return client.terminate();
      }

      client.isAlive = false;

      client.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(interval);
  });

  return wss;
}
