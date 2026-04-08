import { rooms } from "../ws/rooms.js";
import type WebSocket from "ws";

export function handleJoinRoom(ws: WebSocket, roomId: string) {
  if (!roomId) return;

  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }

  const room = rooms.get(roomId)!;
  room.add(ws);

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
}

export function handleDisconnect(ws: WebSocket): boolean {
  const roomId = (ws as any).roomId;

  if (!roomId || !rooms.has(roomId)) return false;

  const room = rooms.get(roomId)!;
  

  room.delete(ws);

  if (room.size === 0) {
    rooms.delete(roomId);
  }
  return true
}
