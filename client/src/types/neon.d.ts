import { FriendRequestStatusType } from "./enums";

export interface Post {
  id: number;
  created_at: Date;
  description: string | null;
  author_id: string;
  title: string;
}

export interface UserJoin {
  id: string;
  name: string;
  username: string;
  profile_url: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  created_at: Date;
  updated_at: Date;
  bio: string | null;
  profile_url?: null | string;
}

export interface Index {
  id: string;
  index: Record<
    string,
    Record<string, { title?: boolean; description?: boolean }[]>
  >;
  updated_at: Date;
}

export interface JoinLike {
  like_id: string | undefined | null;
}

export interface Like {
  user_id: string;
  post_id: number;
  created_at: Date;
  id: string;
}

export interface Tag {
  id: number;
  tag: string;
  created_at: Date;
}

export type MediaEnumType = "image" | "video";

export interface MediaType {
  id: string;
  fileurl: string;
  type: MediaEnumType;
  post_id: number;
  created_at: Date;
}

export interface CommentType {
  id: string;
  content: string;
  post_id: number;
  user_id: string;
  created_at: Date;
}

export interface CommentUserType {
  id: string;
  name: string;
  username: string;
  profile_url?: string | null;
}

export interface FollowType {
  id: string;
  follow_id: string;
  follower_id: string;
  created_at: Date;
}

export interface UserFollowJoinType {
  id: string | null;
  created_at: Date | null;
}

export type NotificationEnumType =
  | "FRIEND_REQUEST"
  | "SYSTEM"
  | "NEW_MESSAGE"
  | "NEW_FOLLOWER"
  | "NEW_POST";

export interface NotificationType {
  id: string;
  user_id: string;
  type: NotificationEnumType;
  title: string;
  body: {
    sentAt: Date;
    description?: string;
  };
  isread: boolean;
  created_at: Date;
}

export interface FriendRequestUserJoinType {
  profile_url: string;
  name: string;
  username: string;
}

export interface FriendRequestType {
  id: string;
  status: FriendRequestStatusType;
  created_at: Date;
  user: FriendRequestUserJoinType;
}

export interface FriendType {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: Date;
  user: FriendRequestUserJoinType;
}

export interface FriendSettingsType {
  id: string | null;
  muted: boolean | null;
  blocked: boolean | null;
}

export interface PostMedia extends Post {
  media: {
    id: string | null;
    fileurl: string | null;
    type: MediaEnumType | null;
    mediaUrl: string | undefined;
  };
  likes: number;
  comments: number;
}
