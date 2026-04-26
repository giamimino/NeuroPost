import React from "react";
import { CommentReactionEnum } from "./enums";
import { ForyouPost } from "./global";

export interface ToggleContextType {
  checked: boolean;
  toggle: () => void;
}

export interface CommentContextType {
  openReplies: boolean;
  setOpenReplies: (value: boolean) => void;
  setCloseReplies: () => void;
  setToggleReplies: () => void;
}

export interface ContentContextType {
  expanded: boolean;
  toggleExpanded: () => void;
  setExpanded: (value: boolean) => void;
}

export interface CommentPostContextType {
  ref: React.RefObject<HTMLInputElement | null>;
  status: "idle" | "loading" | "success";
  setStatus: (
    value: ThisParameterType.CommentPostContextType["status"],
  ) => void;
  post_id: number;
  comment_id: string;
}

export interface PostContextType {
  post: ForyouPost;
  onLike: (likeId: string) => void;
  onUnlike: () => void;
}

export interface UserReactionType {
  reactionId: string;
  type: CommentReactionEnum;
}

export type CommentReactionsCountType = Record<
  CommentReactionEnum,
  { count: number }
>;

export interface CommentReactionContextType {
  userReaction: UserReactionType | null;
  commentId: string;
  reactions: CommentReactionsCountType;
  increaseReaction: (type: CommentReactionEnum, count: number) => void;
  decreaseReaction: (type: CommentReactionEnum, count: number) => void;
  setUserReaction: React.Dispatch<
    React.SetStateAction<UserReactionType | null>
  >;
}
