import React from "react";
import { UserStatusType } from "./enums";

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
