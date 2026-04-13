import z from "zod";

export const CommentSchema = z.object({
  id: z.uuid(),
  content: z.string(),
  post_id: z.number(),
  user_id: z.uuid(),
  parent_id: z.uuid().nullable(),
  created_at: z.string(),
  role: z.union([z.literal("creator"), z.literal("guest")]),
  replies_count: z.number().min(0),
  user: z.object({
    id: z.uuid(),
    name: z.string(),
    profile_url: z.string(),
    username: z.string(),
  })
})

export type CommentSchemaType = z.infer<typeof CommentSchema>