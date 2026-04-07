import type WebSocket from "ws";

export const rooms = new Map<String, Set<WebSocket>>();
