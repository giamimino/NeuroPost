import {
  MAX_POST_IMAGE_SIZE,
  MAX_POST_VIDEO_SIZE,
  MAX_PROFILE_IMAGE_SIZE,
} from "./validators";

export const ERRORS = {
  GENERIC_ERROR: {
    title: "Unexpected Error",
    description: "Something went wrong. Please try again later.",
  },

  IMAGE_TYPE_ERROR: {
    title: "Invalid Image Format",
    description: "Only PNG, JPG, JPEG, and WEBP image formats are allowed.",
  },

  VIDEO_TYPE_ERROR: {
    title: "Invalid Video Format",
    description: "Only MP4 and WEBM video formats are allowed.",
  },

  MAX_PROFILE_IMAGE_SIZE_ERROR: {
    title: "Image Too Large",
    description: `Profile image must be smaller than ${MAX_PROFILE_IMAGE_SIZE / 1024 / 1024}MB.`,
  },

  MAX_POST_IMAGE_SIZE_ERROR: {
    title: "Image Too Large",
    description: `Post image must be smaller than ${MAX_POST_IMAGE_SIZE / 1024 / 1024}MB.`,
  },

  MAX_VIDEO_SIZE_ERROR: {
    title: "Video Too Large",
    description: `Video must be smaller than ${MAX_POST_VIDEO_SIZE / 1024 / 1024}MB.`,
  },

  NETWORK_ERROR: {
    title: "Network Error",
    description:
      "Unable to connect to the server. Please check your internet connection.",
  },

  UNAUTHORIZED: {
    title: "Unauthorized",
    description: "You must be logged in to perform this action.",
  },

  FORBIDDEN: {
    title: "Access Denied",
    description: "You do not have permission to perform this action.",
  },

  USER_NOT_FOUND: {
    title: "User Not Found",
    description: "The requested user does not exist.",
  },

  POST_NOT_FOUND: {
    title: "Post Not Found",
    description: "The post you are trying to access no longer exists.",
  },

  COMMENT_NOT_FOUND: {
    title: "Comment Not Found",
    description: "The comment you are looking for does not exist.",
  },

  INVALID_INPUT: {
    title: "Invalid Input",
    description:
      "Some of the provided information is not valid. Please check and try again.",
  },

  REQUIRED_FIELDS: {
    title: "Missing Information",
    description: "Please fill in all required fields before continuing.",
  },

  FILE_TOO_LARGE: {
    title: "File Too Large",
    description: "The selected file exceeds the allowed size limit.",
  },

  INVALID_FILE_TYPE: {
    title: "Unsupported File Type",
    description: "This file format is not supported.",
  },

  IMAGE_UPLOAD_FAILED: {
    title: "Upload Failed",
    description: "We couldn’t upload your image. Please try again.",
  },

  VIDEO_UPLOAD_FAILED: {
    title: "Upload Failed",
    description: "We couldn’t upload your video. Please try again.",
  },

  POST_CREATE_FAILED: {
    title: "Post Failed",
    description: "Your post could not be created. Please try again.",
  },

  POST_DELETE_FAILED: {
    title: "Delete Failed",
    description: "The post could not be deleted. Please try again.",
  },

  POST_UPDATE_FAILED: {
    title: "Update Failed",
    description: "The post could not be updated. Please try again.",
  },

  COMMENT_CREATE_FAILED: {
    title: "Comment Failed",
    description: "Your comment could not be added. Please try again.",
  },

  LIKE_FAILED: {
    title: "Action Failed",
    description: "We couldn’t like the post. Please try again.",
  },

  SERVER_ERROR: {
    title: "Server Error",
    description:
      "Our servers are having issues right now. Please try again later.",
  },
  SESSION_EXPIRED: {
    title: "Session Expired",
    description: "Your session has expired. Please log in again.",
  },

  EMAIL_ALREADY_EXISTS: {
    title: "Email Already in Use",
    description: "An account with this email already exists.",
  },

  USERNAME_TAKEN: {
    title: "Username Unavailable",
    description: "This username is already taken. Please choose another one.",
  },

  PASSWORD_TOO_WEAK: {
    title: "Weak Password",
    description: "Your password must be stronger and contain more characters.",
  },

  INVALID_CREDENTIALS: {
    title: "Login Failed",
    description: "Incorrect email or password.",
  },

  TOO_MANY_REQUESTS: {
    title: "Too Many Requests",
    description:
      "You are doing that too often. Please slow down and try again later.",
  },

  RATE_LIMITED: {
    title: "Rate Limited",
    description: "You have reached the request limit. Please wait a moment.",
  },

  TOKEN_INVALID: {
    title: "Invalid Token",
    description: "Your authentication token is invalid or expired.",
  },

  TOKEN_MISSING: {
    title: "Authentication Required",
    description: "No authentication token was provided.",
  },

  DATA_CONFLICT: {
    title: "Conflict Error",
    description: "This action conflicts with existing data.",
  },

  DUPLICATE_ACTION: {
    title: "Already Done",
    description: "You have already performed this action.",
  },

  FOLLOW_FAILED: {
    title: "Follow Failed",
    description: "Unable to follow this user. Please try again.",
  },

  UNFOLLOW_FAILED: {
    title: "Unfollow Failed",
    description: "Unable to unfollow this user. Please try again.",
  },

  SHARE_FAILED: {
    title: "Share Failed",
    description: "This post could not be shared. Please try again.",
  },

  SAVE_FAILED: {
    title: "Save Failed",
    description: "This post could not be saved. Please try again.",
  },

  REPORT_FAILED: {
    title: "Report Failed",
    description: "We couldn’t submit your report. Please try again later.",
  },

  BLOCK_FAILED: {
    title: "Block Failed",
    description: "This user could not be blocked. Please try again.",
  },

  PROFILE_UPDATE_FAILED: {
    title: "Profile Update Failed",
    description: "Your profile changes could not be saved.",
  },

  SETTINGS_UPDATE_FAILED: {
    title: "Settings Update Failed",
    description: "Your settings could not be updated.",
  },

  MEDIA_PROCESSING_FAILED: {
    title: "Media Processing Error",
    description: "We couldn’t process your media file. Please try another one.",
  },

  VIDEO_TRANSCODE_FAILED: {
    title: "Video Processing Failed",
    description: "The video could not be prepared for streaming.",
  },

  IMAGE_COMPRESS_FAILED: {
    title: "Image Processing Failed",
    description: "The image could not be optimized.",
  },

  SEARCH_FAILED: {
    title: "Search Error",
    description: "We couldn’t complete your search. Please try again.",
  },

  NOTIFICATION_FAILED: {
    title: "Notification Error",
    description: "Notifications could not be loaded.",
  },

  CHAT_SEND_FAILED: {
    title: "Message Failed",
    description: "Your message could not be sent.",
  },

  CHAT_LOAD_FAILED: {
    title: "Chat Error",
    description: "Messages could not be loaded.",
  },

  FEATURE_NOT_AVAILABLE: {
    title: "Feature Unavailable",
    description: "This feature is not available right now.",
  },

  MAINTENANCE_MODE: {
    title: "Maintenance",
    description: "The system is under maintenance. Please try again later.",
  },

  VERSION_NOT_SUPPORTED: {
    title: "Update Required",
    description: "Your app version is no longer supported. Please update.",
  },
} as const;
