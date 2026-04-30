import { CommentReactionEnum } from "@/types/enums";
import React from "react";

export type ReactionContent = string | React.ReactNode;

export const CommentsReactions: Record<CommentReactionEnum, ReactionContent> = {
  ANGRY: "😡",
  HEART: "❤️",
  LAUGH: "🤣",
  LIKE: "👍",
  WOW: "😮",
};

export const ReactionsConst: CommentReactionEnum[] = [
  "ANGRY",
  "HEART",
  "LAUGH",
  "LIKE",
  "WOW",
];
