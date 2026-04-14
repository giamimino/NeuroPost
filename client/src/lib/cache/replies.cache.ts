import { CommentReplyType } from "@/schemas/comment/reply.schema";

export const RepliesCache = new Map<String, Set<CommentReplyType>>();
