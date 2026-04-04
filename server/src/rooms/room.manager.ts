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
