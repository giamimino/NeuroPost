"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

export default function Page() {
  const ws = useRef<WebSocket | null>(null)

  const handleSend = () => {
    if(ws.current?.readyState === WebSocket.OPEN) {
    }
  }

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:3001");

    ws.current.onopen = () => {
      console.log("Connected");
      ws.current?.send("Hello server");
    };

    ws.current.onmessage = (event) => {
      console.log("Message from server:", event.data);
    };

    ws.current.addEventListener("message", (message) => {
      console.log(message.data);
    })

    return () => ws.current?.close();
  }, []);

  return <div className="pt-20">
    <Button onClick={handleSend}>
      50 message
    </Button>
  </div>;
}