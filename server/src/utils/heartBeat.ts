import { WS } from "../types/ws.types.js";

export function heartBeat(this: WS) {
  this.isAlive = true;
}
