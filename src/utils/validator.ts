import {
  GENERIC_FILE_TYPE_ERROR,
  IMAGE_TYPE_ERROR,
  MAX_POST_IMAGE_SIZE_ERROR,
  MAX_VIDEO_SIZE_ERROR,
  VIDEO_TYPE_ERROR,
} from "@/constants/error-handling";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_POST_IMAGE_SIZE,
  MEDIA_TYPES,
} from "@/constants/validators";

export function MediaValidator(file: File): string | null {
  let type;

  type = file.type.split("/")[0];
  if(type === "video" && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return VIDEO_TYPE_ERROR
  } else if(
    type === "image" && !ALLOWED_IMAGE_TYPES.includes(file.type)
  ) {
    return IMAGE_TYPE_ERROR
  } else if(!MEDIA_TYPES.includes(type)) {
    return GENERIC_FILE_TYPE_ERROR
  }

  if(type === "video" && file.size > MAX_POST_IMAGE_SIZE) {
    return MAX_VIDEO_SIZE_ERROR
  } else if(type === "image" && file.size > MAX_POST_IMAGE_SIZE) {
    return MAX_POST_IMAGE_SIZE_ERROR
  }

  return null;
}
