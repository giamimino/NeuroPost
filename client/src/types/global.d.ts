import React from "react";
import { UserStatusType } from "./enums";
import { MediaEnumType, Post, UserJoin } from "./neon";

export interface Children {
  children: React.ReactNode;
}

export interface JWTUserPaylaod {
  exp: number;
  iat: number;
  userId: string;
  username: string;
  status: UserStatusType;
}

export interface TagType {
  id: number;
  tag: string;
}

export type UserStatsType = Record<string, number>;

export type UserCommentRoleType = "creator" | "guest";

export type GenericStatus = "idle" | "loading" | "success" | "error";

export interface ForyouPost extends Post {
  tags: TagType[];
  like_id: string | null;
  media: { type: MediaEnumType; url: string | null };
  user: UserJoin;
  likes: string;
}

export interface ClassName {
  className?: string
}