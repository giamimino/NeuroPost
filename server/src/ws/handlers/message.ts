import { validateMessage } from "../../lib/validators/message.validator.js";
import { handleDisconnect, handleJoinRoom } from "../../rooms/room.manager.js";
import { rooms } from "../rooms.js";
import WebSocket from "ws";

export function handleMessage(ws: WebSocket, raw: WebSocket.RawData) {
  console.log(rooms.values());

  const validationResult = validateMessage(raw);
  console.log(validationResult);

  if (validationResult.error || !validationResult) {
    ws.send(
      JSON.stringify({
        error: validationResult.error,
      }),
    );
    return;
  }

  switch (validationResult.type) {
    case "message":
      handleChatMessage(ws, validationResult.payload);
      break;
    case "ping":
      ws.send(
        JSON.stringify({
          type: "pong",
          payload: {
            success: true,
          },
        }),
      );
      break;
    case "join-room":
      handleJoinRoom(ws, validationResult.payload.roomId);

      break;
    case "disconnect-room":
      const success = handleDisconnect(ws);
      ws.send(JSON.stringify({
        type: "disconnect-room-result",
        payload: {
          success,
        }
      }))
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
