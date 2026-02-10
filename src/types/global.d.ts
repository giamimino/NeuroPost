import React from "react";

export interface Children {
  children: React.ReactNode
}

export interface JWTUserPaylaod {
  exp: number,
  iat: number,
  userId: number
}

export interface TagType {
  id: number,
  tag: string
}