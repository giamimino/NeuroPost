import React from "react";
import { WSSendType } from "../types/ws.types.js";

export default function isWSSendType(type: any): type is WSSendType {
  return (["ping", "message", "join-room"] as WSSendType[]).includes(type);
}
