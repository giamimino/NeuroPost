import { validateMessage } from "../../lib/validators/message.validator.js";
import { rooms } from "../rooms.js";
import WebSocket from "ws";

export function handleMessage(ws: WebSocket, raw: WebSocket.RawData) {
  let data;

  const validationResult = validateMessage(raw);
  if (validationResult.error) {
    ws.send(
      JSON.stringify({
        error: validationResult.error,
      }),
    );
    return;
  } else if (validationResult.data) {
    data = validationResult.data;
  }

  switch (data.type) {
    case "message":
      handleChatMessage(ws, data.payload);
      break;
    case "ping":
      ws.send("pong");
      break;
    case "join-room":
      console.log(data);
      ws.send("join-room");
      break;
    default:
      ws.send("Unknown message type");
  }
}

export function handleChatMessage(ws: WebSocket, payload: any) {
  const roomId = (ws as any).roomId;

  if (!roomId || !rooms.has(roomId)) return;

  const room = rooms.get(roomId)!;

  for (const client of room) {
    if (client.readyState === 1) {
      client.send(
        JSON.stringify({
          type: "message",
          payload,
        }),
      );
    }
  }
}
