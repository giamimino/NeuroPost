
export type WSSendType = "message" | "ping"

export interface WSSend {
  type: WSSendType,
  payload: string
}