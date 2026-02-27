import React from "react";

export interface Children {
  children: React.ReactNode;
}

export interface JWTUserPaylaod {
  exp: number;
  iat: number;
  userId: string;
}

export interface TagType {
  id: number;
  tag: string;
}

export type UserStatsType = Record<string, number>;
