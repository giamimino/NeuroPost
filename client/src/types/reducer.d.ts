

// repliesReducer

export type RepliesState = Map<string, Set<CommentReplyType>>

export interface RepliesAction {
  type: "SET_REPLIES",
  comment_id: string,
  replies: Set<CommentReplyType>
}