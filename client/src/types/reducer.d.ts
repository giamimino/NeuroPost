import { CommentReplyType } from "@/schemas/comment/reply.schema";
import { StatsPreviewType } from "./global";
import { UserStatsPreviewUserType } from "./neon";

// repliesReducer

export type RepliesState = Map<string, Set<CommentReplyType>>;

export type RepliesAction =
  | {
      type: "SET_REPLIES";
      comment_id: string;
      replies: Set<CommentReplyType>;
    }
  | {
      type: "DEL_REPLY";
      comment_id: string;
      reply_id: string;
    }
  | {
      type: "ADD_REPLY";
      comment_id: string;
      payload: CommentReplyType;
    }
  | {
      type: "INCREMENT_REPLY_COUNT";
      reply_id: string;
    }
  | {
      type: "DECREMENT_REPLY_COUNT";
      reply_id: string;
    };

// user stats reducer

export type UserStatsState = Map<
  Lowercase<StatsPreviewType>,
  Set<UserStatsPreviewUserType & { likes_count?: number }>
>;

export type UserStatsAction = {
  type: "ADD_STATS";
  key: Lowercase<StatsPreviewType>;
  newStats: (UserStatsPreviewUserType & { likes_count?: number })[]
}
