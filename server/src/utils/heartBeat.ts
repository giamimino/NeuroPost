import { WebSocket } from "ws";


export function heartBeat(this: WebSocket) {
  (this as any).isAlive = true
  
}