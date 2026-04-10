"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { auth, getAuthUser } from "@/lib/auth";
import { WSSend } from "@/types/ws";
import { useEffect, useRef, useState } from "react";

export default function Page() {
  const ws = useRef<WebSocket | null>(null);
  const roomRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [roomId, setRoomId] = useState<string | undefined>();

  const handleSend = async () => {
    if (!inputRef.current || !roomId) return;
    const message = inputRef.current.value;
    if (!message.trim()) return;

    const auth = await getAuthUser()
    console.log(auth);
    

    if(auth.error) return;

    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "chat-message",
          payload: { message, userId: auth.user.userId },
        }),
      );
    }
  };

  const handleCreateRoom = () => {
    if (!roomRef.current || !ws.current) return;
    const room = roomRef.current.value;

    ws.current.send(
      JSON.stringify({
        type: "create-room-payload",
        payload: {
          id: room,
          isPublic: true,
          ownerId: null,
          members: [
            "40a1a18d-687e-4aa1-95b9-7772bdc7c750",
            "b76f48d3-692a-4eb3-990a-9374b648fb19",
          ],
        },
      }),
    );
  };

  const handleJoinRoom = () => {
    if (!roomRef.current || !ws.current) return;
    const room = roomRef.current.value;

    ws.current.send(
      JSON.stringify({
        type: "join-room",
        payload: {
          roomId: room,
        },
      } as WSSend),
    );
  };

  useEffect(() => {
    ws.current = new WebSocket(
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8080",
    );

    let interval: NodeJS.Timeout;

    const connect = () => {
      if (!ws.current) return;

      ws.current.onopen = () => {
        console.log("[WS] Connected");
        interval = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(
              JSON.stringify({ type: "ping", payload: { success: true } }),
            );
          }
        }, 20000);
      };

      ws.current.onmessage = (event) => {
        console.log(JSON.parse(event.data));
        const data = JSON.parse(event.data);
        const payload = data.payload;

        switch (data.type) {
          case "join-room-result":
            if (payload.success) setRoomId(payload.roomId);
            break;
          case "pong":
            console.log(data.payload);

            break;
          case "chat-message-result":
            if(payload.success) {
              setMessages((prev) => [...prev, payload.message]);
            }
            break;
          case "create-room-result":
            if (payload.success) setRoomId(payload.roomId);
            break;

          default:
            console.log(data);
            break;
        }
      };

      ws.current.onclose = () => {
        console.log("Disconnected. Reconnecting...");
        clearInterval(interval);
        setTimeout(connect, 2000);
      };
    };

    connect();

    return () => {
      clearInterval(interval);
      ws.current?.close();
    };
  }, []);

  return (
    <div className="pt-20">
      <div>
        <Input ref={roomRef} placeholder="join or create room" />
        <Button onClick={handleCreateRoom}>create room</Button>
        <Button onClick={handleJoinRoom}>join room</Button>
      </div>
      {roomId && (
        <Card>
          <Input ref={inputRef} />
          <Button onClick={handleSend}>send</Button>
          <Card className="flex flex-col">
            {messages.map((m) => (
              <CardDescription key={m}>{m}</CardDescription>
            ))}
          </Card>
        </Card>
      )}
      <p></p>
    </div>
  );
}
