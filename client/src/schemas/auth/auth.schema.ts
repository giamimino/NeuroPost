import { ERRORS } from "@/constants/error-handling";
import z from "zod";

export const PasswordValidatorSchema = z
  .string()
  .min(8, JSON.stringify(ERRORS.PASSWORD_TOO_SHORT))
  .max(20, JSON.stringify(ERRORS.PASSWORD_TOO_LONG))
  .regex(/[a-z]/, JSON.stringify(ERRORS.PASSWORD_NO_LOWERCASE))
  .regex(/[A-Z]/, JSON.stringify(ERRORS.PASSWORD_NO_UPPERCASE))
  .regex(/[0-9]/, JSON.stringify(ERRORS.PASSWORD_NO_NUMBER))
  .regex(/[^a-zA-Z0-9]/, JSON.stringify(ERRORS.PASSWORD_NO_SPECIAL_CHAR));

export const UsernameSchema = z
  .string()
  .min(3, JSON.stringify(ERRORS.USERNAME_TOO_SMALL))
  .max(20, JSON.stringify(ERRORS.USERNAME_TOO_LARGE))
  .regex(/^[A-Za-z._-]+$/, JSON.stringify(ERRORS.USERNAME_IS_WRONG));

export const JWTUserPayloadSchema = z.object({
  userId: z.uuid(),
  username: UsernameSchema,
  status: z.enum(["active", "inactive"]),

  iat: z.number(),
  exp: z.number()
})