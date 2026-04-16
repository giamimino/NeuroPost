import { ERRORS } from "@/constants/error-handling";
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email({ message: JSON.stringify(ERRORS.EMAIL_REQUIRED) }),
  password: z.string({ message: JSON.stringify(ERRORS.INVALID_CREDENTIALS)}),
});
