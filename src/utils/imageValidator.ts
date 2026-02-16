import { ALLOWED_IMAGE_TYPES, MAX_PROFILE_IMAGE_SIZE } from "@/constants/validators";


export function ImageValidator(file: File) {
  if(!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Only PNG, JPG, JPEG, WEBP allowed"
  }

  if(file.size > MAX_PROFILE_IMAGE_SIZE) {
    return "Image too large (max 2MB)"
  }

  return null
}