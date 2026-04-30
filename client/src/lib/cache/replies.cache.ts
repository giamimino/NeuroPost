import { CommentReplyType } from "@/schemas/comment/reply.schema";

export const RepliesCache = new Map<string, Set<CommentReplyType>>();