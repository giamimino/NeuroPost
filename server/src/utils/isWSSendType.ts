import React from "react";
import type { WSSendType } from "src/types/ws.types";

export default function isWSSendType(type: any): type is WSSendType {
  return (["ping", "message", "join-room"] as WSSendType[]).includes(type);
}
