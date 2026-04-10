import WebSocket from "ws";
import z from "zod";
import { RoomCreatePayloadSchema, RoomMessageSchema, RoomSchema } from "./room.schema.js";
import { ERRORS } from "../../constants/errors.js";

export const MessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("chat-message"),
    payload: z.object({
      message: z.string().min(1),
      userId: z.uuid(),
    }),
  }),

  z.object({
    type: z.literal("chat-message-result"),
    payload: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  }),

  z.object({
    type: z.literal("ping"),
    payload: z.object({
      success: z.boolean(),
    }),
  }),

  z.object({
    type: z.literal("pong"),
    payload: z.object({
      success: z.boolean(),
    }),
  }),

  z.object({
    type: z.literal("leave-room"),
    payload: z.object({
      roomId: z.string(),
    }),
  }),

  z.object({
    type: z.literal("leave-room-result"),
    payload: z.object({
      success: z.boolean(),
      roomId: z.string(),
    }),
  }),

  z.object({
    type: z.literal("join-room"),
    payload: z.object({
      roomId: z.string(),
    }),
  }),

  z.object({
    type: z.literal("error"),
    payload: z.object({
      error: z.object({
        title: z.string(),
        description: z.string(),
      }),
    }),
  }),

  z.object({
    type: z.literal("join-room-result"),
    payload: z.object({
      success: z.boolean(),
      roomId: z.string(),
    }),
  }),

  z.object({
    type: z.literal("create-room-payload"),
    payload: RoomCreatePayloadSchema,
  }),

  z.object({
    type: z.literal("create-room"),
    payload: RoomMessageSchema.pick({
      id: true,
      ownerId: true,
      isPublic: true,
      members: true,
      sockets: true,
    }).partial({ members: true }),
  }),

  z.object({
    type: z.literal("create-room-result"),
    payload: z.object({
      success: z.boolean(),
      roomId: z.string(),
    }),
  }),
]);

export const validateMessage = (raw: WebSocket.RawData) => {
  try {
    const parsed = JSON.parse(raw.toString());
    return MessageSchema.safeParse(parsed);
  } catch {
    return { error: ERRORS.VALIDATION_ERROR, data: null };
  }
};
