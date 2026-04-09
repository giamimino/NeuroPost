import type WebSocket from "ws";
import { RoomType } from "../types/room.js";

export const rooms = new Map<String, RoomType>();
