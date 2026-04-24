export type NotificationEnumType =
  | "FRIEND_REQUEST"
  | "FRIEND_DECLINE"
  | "FRIEND_ACCEPT"
  | "SYSTEM"
  | "NEW_MESSAGE"
  | "NEW_FOLLOWER"
  | "NEW_POST"
  | "NEW_LIKE";

export type FriendRequestStatusType = "accepted" | "rejected" | "pending";

export type UserStatusType = "active" | "inactive";

export type UserSettingsType = "boolean" | "json" | "string";

export type CommentReactionEnum = 'LIKE' | 'LAUGH' | 'HEART' | 'ANGRY' | 'WOW'