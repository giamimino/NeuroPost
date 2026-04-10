import z from "zod";


export const UserSchema = z.object({
  userId: z.uuid(),
  username: z.string(),
  status: z.enum(["active", "inactive"]),
})