
export interface Post {
  id: number,
  created_at: Date,
  description: string | null,
  author_id: string,
  title: string,
}

export interface UserJoin {
  name: string,
  username: string,
  profile_url: string | null
}

export interface User {
  id: string,
  email: string,
  name: string,
  username: string,
  created_at: Date,
  updated_at: Date,
  bio: string | null,
  profile_url?: null | string
}

export interface Index {
  id: string,
  index: Record<string, Record<string, { title?: boolean, description?: boolean }[]>>,
  updated_at: Date
}

export interface JoinLike {
  like_id: string | undefined | null
}

export interface Like {
  user_id: string,
  post_id: number,
  created_at: Date,
  id: string,
}

export interface Tag {
  id: number,
  tag: string,
  created_at: Date
}

export type MediaEnumType = "image" | "video"

export interface MediaType {
  id: string,
  fileurl: string,
  type: MediaEnumType,
  post_id: number,
  created_at: Date
}

export interface CommentType {
  id: string,
  content: string,
  post_id: number,
  user_id: string,
  created_at: Date
}

export interface CommentUserType {
  id: string,
  name: string,
  username: string,
  profile_url?: string | null,
}

export interface FollowType {
  id: string,
  follow_id: string,
  follower_id: string,
  created_at: Date
}

export interface UserFollowJoinType {
  id: string,
  created_at: Date
}