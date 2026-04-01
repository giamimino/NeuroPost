export type NotificationEnumType =
  | "FRIEND_REQUEST"
  | "SYSTEM"
  | "NEW_MESSAGE"
  | "NEW_FOLLOWER"
  | "NEW_POST"
  | "NEW_LIKE";

export type FriendRequestStatusType = "accepted" | "rejected" | "pending";

export type UserStatusType = "active" | "inactive";

export type UserSettingsType = "boolean" | "json" | "string";
