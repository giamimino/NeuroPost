import WebSocket from "ws";

export interface RoomType {
  id: string;
  ownerId: string | null;
  members: Set<string>;
  sockets: Set<WebSocket>;
  isPublic: boolean;
}
