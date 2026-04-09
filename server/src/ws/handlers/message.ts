import { ERRORS } from "../../constants/errors.js";
import { validateMessage } from "../../lib/validators/message.validator.js";
import {
  canJoinRoom,
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
} from "../../rooms/room.manager.js";
import { RoomType } from "../../types/room.js";
import { WSSendType } from "../../types/ws.types.js";
import { rooms } from "../rooms.js";
import WebSocket from "ws";

export function handleMessage(ws: WebSocket, raw: WebSocket.RawData) {
  const validationResult = validateMessage(raw);

  if (validationResult.error || !validationResult) {
    ws.send(
      JSON.stringify({
        error: validationResult.error,
      }),
    );
    return;
  }

  switch (validationResult.type as WSSendType) {
    case "chat-message": {
      const { message } = validationResult.payload;
      if (!(ws as any).roomId) return;

      const room = getRoom((ws as any).roomId);
      if (!room) return;

      handleChatMessage(
        {
          type: "chat-message",
          payload: {
            message,
            userId: (ws as any).user!.id,
          },
        },
        room,
      );

      break;
    }
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

    case "leave-room": {
      const roomId = (ws as any).roomId;

      if (!roomId) return;

      const room = getRoom(roomId);

      if (!room) return;

      leaveRoom(ws, room);
      (ws as any).roomId = null;

      ws.send(
        JSON.stringify({
          type: "leave-room-result",
          payload: {
            success: true,
            roomId,
          },
        }),
      );
      break;
    }
    case "join-room": {
      const { roomId } = validationResult.payload;

      if (!roomId) return;

      const room = getRoom(roomId);

      if (!room) {
        return ws.send(
          JSON.stringify({
            type: "error",
            payload: {
              error: ERRORS.ROOM_NOT_FOUND,
            },
          }),
        );
      }

      if (!(ws as any).user || !canJoinRoom((ws as any).user!, room)) {
        return ws.send(
          JSON.stringify({
            type: "error",
            payload: {
              error: ERRORS.FORBIDDEN,
            },
          }),
        );
      }

      joinRoom(ws, room);
      (ws as any).roomId = roomId;

      ws.send(
        JSON.stringify({
          type: "join-room-result",
          payload: {
            success: true,
            roomId,
          },
        }),
      );
      break;
    }
    case "create-room": {
      const { roomId, isPublic, members } = validationResult.payload;

      if (!roomId) return;

      const room = createRoom(roomId, (ws as any).user.id, isPublic, members);

      if (!room) {
        return ws.send(
          JSON.stringify({
            type: "error",
            payload: {
              error: ERRORS.SERVER_ERROR,
            },
          }),
        );
      }

      ws.send(
        JSON.stringify({
          type: "create-room-result",
          payload: {
            success: true,
            roomId: room.id,
          },
        }),
      );
    }
    default:
      ws.send("Unknown message type");
  }
}

export function handleChatMessage(message: any, room: RoomType) {
  const data = JSON.stringify(message);

  for (const client of room.sockets) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}
