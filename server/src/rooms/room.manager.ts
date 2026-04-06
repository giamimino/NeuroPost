import { rooms } from "../ws/rooms";
import type WebSocket from "ws";

export function handleJoinRoom(ws: WebSocket, roomId: string) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }

  const room = rooms.get(roomId)!;
  room.add(ws);

  (ws as any).roomId = roomId;

  ws.send(
    JSON.stringify({
      type: "joined",
      roomId,
    }),
  );
}

export function handleDisconnect(ws: WebSocket) {
  const roomId = (ws as any).roomId;

  if (!roomId || !rooms.has(roomId)) return;

  const room = rooms.get(roomId)!;

  room.delete(ws);

  if (room.size === 0) {
    rooms.delete(roomId);
  }
}
