"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WSSend } from "@/types/ws";
import { useEffect, useRef, useState } from "react";

export default function Page() {
  const ws = useRef<WebSocket | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const roomRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [roomId, setRoomId] = useState<string | undefined>();

  const handleSend = () => {
    if (!inputRef.current || !roomId) return;
    const message = inputRef.current.value;
    if (!message.trim()) return;

    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "message",
          payload: { message, roomId },
        } as WSSend),
      );
    }
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
    ws.current = new WebSocket("ws://localhost:3001");

    ws.current.onopen = () => {
      console.log("Connected");
      ws.current?.send(JSON.stringify({ type: "ping" }));
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
        case "message":
          setMessages((prev) => [...prev, payload.message]);
          break;

        default:
          console.log(data);
          break;
      }
    };

    return () => ws.current?.close();
  }, []);

  return (
    <div className="pt-20">
      <div>
        <Input ref={roomRef} placeholder="join or create room" />
        <Button onClick={handleJoinRoom}>Join</Button>
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
    </div>
  );
}
