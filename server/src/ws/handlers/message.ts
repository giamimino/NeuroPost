import { ERRORS } from "../../constants/errors.js";
import {
  canJoinRoom,
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
} from "../../rooms/room.manager.js";
import {
  MessageSchema,
  validateMessage,
} from "../../schemas/ws/message.schema.js";
import { RoomType } from "../../types/room.js";
import WebSocket from "ws";

export function handleMessage(ws: WebSocket, raw: WebSocket.RawData) {
  const validationResult = validateMessage(raw);

  if (validationResult.error || !validationResult.data) {
    ws.send(
      JSON.stringify({
        error: validationResult.error,
      }),
    );
    return;
  }

  const { type, payload } = validationResult.data;

  switch (type) {
    case "chat-message": {
      const { message } = payload;
      if (!(ws as any).roomId) return;

      const room = getRoom((ws as any).roomId);
      if (!room) return;

      const data = MessageSchema.safeParse({
        type: "chat-message",
        payload: {
          message,
          userId: (ws as any).user!.id,
        },
      });

      if (data.error || !data.data) return;

      handleChatMessage(data.data, room);

      break;
    }
    case "ping": {
      const data = MessageSchema.safeParse({
        type: "pong",
        payload: {
          success: true,
        },
      });

      if (data.error || !data.data) return;

      ws.send(JSON.stringify(data.data));

      break;
    }

    case "leave-room": {
      const roomId = (ws as any).roomId;

      if (!roomId) return;

      const room = getRoom(roomId);

      if (!room) return;

      leaveRoom(ws, room);
      (ws as any).roomId = null;

      const result = MessageSchema.safeParse({
        type: "leave-room-result",
        payload: {
          success: true,
          roomId,
        },
      });

      if (!result.data || result.error) return;

      ws.send(JSON.stringify(result.data));
      break;
    }
    case "join-room": {
      const { roomId } = payload;

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

      const result = MessageSchema.safeParse({
        type: "join-room-result",
        payload: {
          success: true,
          roomId,
        },
      });

      if (!result.data || result.error) return;

      ws.send(
        JSON.stringify(result.data),
      );
      break;
    }
    case "create-room": {
      const { id, isPublic, members } = payload;

      if (!id) return;

      const room = createRoom(id, (ws as any).user.id, isPublic, members);

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

      const result = MessageSchema.safeParse({
        type: "create-room-result",
        payload: {
          success: true,
          roomId: room.id,
        },
      });

      if (!result.data || result.error) return;

      ws.send(
        JSON.stringify(result.data),
      );
    }
    default:
      ws.send(JSON.stringify({ error: ERRORS.INVALID_MESSAGE_TYPE }));
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
