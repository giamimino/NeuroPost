

// repliesReducer

import { CommentReplyType } from "@/schemas/comment/reply.schema"

export type RepliesState = Map<string, Set<CommentReplyType>>

export type RepliesAction = {
  type: "SET_REPLIES",
  comment_id: string,
  replies: Set<CommentReplyType>
} | {
  type: "DEL_REPLY",
  comment_id: string
  reply_id: string
} | {
  type: "ADD_REPLY",
  comment_id: string,
  payload: CommentReplyType
} | {
  type: "INCREMENT_REPLY_COUNT",
  reply_id: string
} | {
  type: "DECREMENT_REPLY_COUNT",
  reply_id: string
}