import { ERRORS } from "@/constants/error-handling";
import { z } from "zod";

export const CommentReplyAPISchema = z.object({
  content: z
    .string()
    .min(1, { message: JSON.stringify(ERRORS.MISSING_CONTENT) }),
  post_id: z.number({ message: JSON.stringify(ERRORS.MISSING_CONTENT) }),
  comment_id: z.uuid({ message: JSON.stringify(ERRORS.MISSING_CONTENT) }),
});

export type CommentReplyAPIType = z.infer<typeof CommentReplyAPISchema>;

export const CommentReplySchema = z.object({
  id: z.uuid(),
  content: z.string(),
  post_id: z.number(),
  user_id: z.number(),
  parent_id: z.uuid(),
  created_at: z
    .string()
    .datetime()
    .transform((str) => new Date(str)),
  user: z.object({
    id: z.uuid(),
    name: z.string(),
    profile_url: z.url(),
    username: z.string(),
  }),
});

export type CommentReplyType = z.infer<typeof CommentReplySchema>;
