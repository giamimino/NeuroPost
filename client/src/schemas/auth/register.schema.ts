import z from "zod";
import { PasswordValidatorSchema, UsernameSchema } from "./auth.schema";
import { ERRORS } from "@/constants/error-handling";


export const RegisterSchema = z.object({
  username: UsernameSchema,
  email: z.email({ message: JSON.stringify(ERRORS.EMAIL_REQUIRED )}),
  password: PasswordValidatorSchema
})