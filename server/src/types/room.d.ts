import WebSocket from "ws";

export interface RoomType {
  id: string;
  ownerId: string;
  members: Set<string>;
  sockets: Set<WebSocket>;
  isPublic: boolean;
}
