
export interface Post {
  id: number,
  created_at: Date,
  description: string | null,
  author_id: string,
  image: string | null,
  title: string,
}

export interface UserJoin {
  name: string,
  username: string,
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