import { ERRORS } from "@/constants/error-handling";
import { apiFetch } from "@/lib/apiFetch";
import { RepliesCache } from "@/lib/cache/replies.cache";
import {
  CommentReplyApiGetResSchema,
  CommentReplyType,
} from "@/schemas/comment/reply.schema";
import { useAlertStore } from "@/store/zustand/alertStore";
import { GenericStatus } from "@/types/global";
import { useEffect, useState } from "react";

export default function useReplies(commentId: string, enabled: boolean) {
  const [status, setStatus] = useState<GenericStatus>("idle");
  const [data, setData] = useState<CommentReplyType[] | null>(null);
  const { addAlert } = useAlertStore();

  useEffect(() => {
    if (!enabled) return;

    const cahcedReplies = RepliesCache.get(commentId);
    if (cahcedReplies) {
      setStatus("success");
      const replies = Array.from(cahcedReplies);
      setData(replies);
      return;
    }
    
    const fetchReplies = async () => {
      try {
        setStatus("loading");

        const res = await apiFetch(
          `/api/post/comment/reply?comment_id=${commentId}&limit=20`,
        );
        const data = await res?.json();

        const parsed = CommentReplyApiGetResSchema.safeParse(data);
        
        if (!parsed.success || !parsed.data.ok) {
          addAlert({
            id: crypto.randomUUID(),
            type: "error",
            ...(parsed.data?.error || ERRORS.GENERIC_ERROR),
          });
          return;
        }

        const replies = parsed.data.comments;
        

        if (!replies)
          return addAlert({
            id: crypto.randomUUID(),
            type: "error",
            ...ERRORS.GENERIC_ERROR,
          });

        RepliesCache.set(commentId, new Set(replies));

        setData(replies);
        setStatus("success");
      } catch {
        setStatus("error");
        addAlert({
          id: crypto.randomUUID(),
          type: "error",
          ...ERRORS.GENERIC_ERROR,
        });
      }
    };

    fetchReplies()
  }, [commentId, enabled]);

  return { data, status }
}
