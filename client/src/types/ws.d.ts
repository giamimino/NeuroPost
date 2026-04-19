export type WSSendType = "message" | "ping" | "join-room";

export type WSSend =
  | {
      type: "join-room";
      payload: {
        roomId: string;
      };
    }
  | {
      type: "message";
      payload: {
        message: string;
        roomId: string;
      };
    }
  | {
      type: "ping";
    };
