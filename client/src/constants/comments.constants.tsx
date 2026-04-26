import { CommentReactionEnum } from "@/types/enums";
import { ThumbsUp } from "lucide-react";
import React from "react";

export type ReactionContent = string | React.ReactNode;

export const CommentsReactions: Record<CommentReactionEnum, ReactionContent> = {
  ANGRY: "😡",
  HEART: "❤️",
  LAUGH: "🤣",
  LIKE: "👍",
  WOW: "😮",
};
