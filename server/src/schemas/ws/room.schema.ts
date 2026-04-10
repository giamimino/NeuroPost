import { WebSocket } from "ws";
import { z } from "zod";

export const SocketSchema = z.instanceof(WebSocket);

export const JoinRoomSchema = z.object({
  type: z.literal("join-room"),
  payload: z.object({
    roomId: z.string(),
  }),
});

export const RoomSchema = z.object({
  id: z.string(),
  ownerId: z.string().nullable(),
  members: z.set(z.string()),
  sockets: z.set(SocketSchema),
  isPublic: z.boolean(),
});

export const RoomMessageSchema = z.object({
  id: z.string(),
  ownerId: z.string().nullable(),
  members: z.array(z.string()).optional(),
  sockets: z.set(SocketSchema),
  isPublic: z.boolean(),
});

export const RoomCreatePayloadSchema = z.object({
  id: z.string(),
  ownerId: z.string().nullable(),
  isPublic: z.boolean(),
  members: z.array(z.string()),
});
