import z from "zod";
import { RoomType } from "../types/room.js";
import { UserType } from "../types/user.js";
import { rooms } from "../ws/rooms.js";
import type WebSocket from "ws";
import { RoomSchema } from "../schemas/ws/room.schema.js";

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
  members?: Set<string>,
) {
  if (rooms.has(id)) return;

  const room = RoomSchema.safeParse({
    id,
    ownerId,
    isPublic,
    members: members || new Set(),
    sockets: new Set(),
  });

  if (room.error || !room.data) return;

  rooms.set(id, room.data);

  return room.data;
}
