import { IMAGE_TYPE_ERROR, MAX_PROFILE_IMAGE_SIZE_ERROR } from "@/constants/error-handling";
import { ALLOWED_IMAGE_TYPES, MAX_PROFILE_IMAGE_SIZE } from "@/constants/validators";


export function ImageValidator(file: File) {
  if(!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return IMAGE_TYPE_ERROR
  }

  if(file.size > MAX_PROFILE_IMAGE_SIZE) {
    return MAX_PROFILE_IMAGE_SIZE_ERROR
  }

  return null
}