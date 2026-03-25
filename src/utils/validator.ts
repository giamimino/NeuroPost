import { ERRORS } from "@/constants/error-handling";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_POST_IMAGE_SIZE,
} from "@/constants/validators";

const {
  IMAGE_TYPE_ERROR,
  MAX_POST_IMAGE_SIZE_ERROR,
  MAX_VIDEO_SIZE_ERROR,
  VIDEO_TYPE_ERROR,
} = ERRORS;

export function MediaValidator(
  file: File,
): { title: string; description: string } | null {
  const type = file.type.split("/")[0];

  if (type === "video" && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return VIDEO_TYPE_ERROR;
  } else if (type === "image" && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return IMAGE_TYPE_ERROR;
  }

  if (type === "video" && file.size > MAX_POST_IMAGE_SIZE) {
    return MAX_VIDEO_SIZE_ERROR;
  } else if (type === "image" && file.size > MAX_POST_IMAGE_SIZE) {
    return MAX_POST_IMAGE_SIZE_ERROR;
  }

  return null;
}

export function PasswordValidator(password: string) {
  if (password.length < 8) return { error: ERRORS.PASSWORD_TOO_SHORT };
  if (!/\d/.test(password)) return { error: ERRORS.PASSWORD_NO_NUMBER };
  if (!/[A-Z]/.test(password)) return { error: ERRORS.PASSWORD_NO_UPPERCASE };
  if (!/[a-z]/.test(password)) return { error: ERRORS.PASSWORD_NO_LOWERCASE };
  if (!/[^a-zA-Z0-9]/.test(password))
    return { error: ERRORS.PASSWORD_NO_SPECIAL_CHAR };
  return { ok: true };
}
