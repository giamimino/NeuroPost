export type WSSendType = "message" | "ping";

export type WSSend =
  | {
      type: "join-room";
      payload: {
        roomId: string
      }
    }
  | {
      type: WSSendType;
      payload: string;
    };
