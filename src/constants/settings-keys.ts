const SETTINGS_KEYS = {
  NOTIFICATIONS_SETTINGS_KEYS: {
    LIKES: "likes_notifications",
    COMMENTS: "comments_notifications",
    NEW_FOLLOWERS: "new_followers_notifications",
    FRIEND_REQUESTS: "friend_requests_notifications",
    FRIEND_ACCEPTS: "friend_accepts_notifications",
  },
  APPEARANCE_SETTINGS_KEYS: {
    DARK_MODE: "dark_mode",
  },
} as const;

export { SETTINGS_KEYS };
