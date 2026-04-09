import { RoomType } from "../types/room.js";
import { UserType } from "../types/user.js";
import { rooms } from "../ws/rooms.js";
import type WebSocket from "ws";

export function getRoom(room: string) {
  return rooms.get(room);
}

export function canJoinRoom(user: UserType, room: RoomType) {
  if (room.isPublic) return true;

  return room.members.has(user.userId);
}

export function joinRoom(ws: WebSocket & { user?: UserType }, room: RoomType) {
  room.sockets.add(ws);
}

export function leaveRoom(ws: WebSocket, room: RoomType) {
  room.sockets.delete(ws);
}

export function createRoom(
  id: string,
  ownerId: string,
  isPublic = false,
  members?: string[],
) {
  if (rooms.has(id)) return;

  const room: RoomType = {
    id,
    ownerId,
    isPublic,
    members: new Set(members || [ownerId]),
    sockets: new Set(),
  };

  rooms.set(id, room);

  return room;
}
