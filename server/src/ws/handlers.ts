import type WebSocket from "ws";

export function handleMessage(ws: WebSocket, raw: WebSocket.RawData) {
  let data;
  
  try {
    data = JSON.parse(raw.toString());
  } catch (error) {
    ws.send(
      JSON.stringify({
        error: { message: "Invalid, message format", status: 1 },
      }),
    );
  }

  switch (data.type) {
    case "message":
      handleChatMessage(ws, data.payload);
      break;
    case "ping":
      ws.send("pong");
      break;
    default:
      ws.send("Unknown message type");
  }
}

export function handleChatMessage(ws: WebSocket, message: string) {
  console.log("Chat:", message);

  ws.send("Server received: " + message);
}
