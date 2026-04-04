import isWSSendType from "../../utils/isWSSendType.js";
import type WebSocket from "ws";

export function handleMessage(ws: WebSocket, raw: WebSocket.RawData) {
  let data;

  try {
    data = JSON.parse(raw.toString());

    if (!data || !isWSSendType(data.type)) {
      ws.send(
        JSON.stringify({
          errorKey: "",
        }),
      );
      return;
    }
  } catch {
    ws.send(
      JSON.stringify({
        errorKey: "",
      }),
    );

    return;
  }

  switch (data.type) {
    case "message":
      handleChatMessage(ws, data.payload);
      break;
    case "ping":
      ws.send("pong");
      break;
    case "join-room":
      console.log(data);
      ws.send("join-room");
      break;
    default:
      ws.send("Unknown message type");
  }
}

export function handleChatMessage(ws: WebSocket, message: string) {
  console.log("Chat:", message);

  ws.send("Server received: " + message);
}
