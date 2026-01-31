
export interface Post {
  id: number,
  created_at: Date,
  description: string | null,
  author_id: string,
  image: string | null,
  title: string,
}

export interface User {
  id: string,
  emai: string,
  name: string,
  username: string,
  created_at: Date,
  updated_at: Date,
  bio: string | null,
}