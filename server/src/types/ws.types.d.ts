import WebSocket from "ws";
import { UserType } from "./user.js";

export type WSSendType =
  | "chat-message"
  | "ping"
  | "join-room"
  | "leave-room"
  | "create-room";

export type WS = WebSocket & {
  auth?: UserType;
  roomId?: string | null;
  isAlive?: boolean;
};
