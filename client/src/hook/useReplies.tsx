import { ERRORS } from "@/constants/error-handling";
import { apiFetch } from "@/lib/apiFetch";
import {
  CommentReplyApiGetResSchema,
  CommentReplyType,
} from "@/schemas/comment/reply.schema";
import { useAlertStore } from "@/store/zustand/alert.store";
import { GenericStatus } from "@/types/global";
import { useEffect, useState } from "react";

export default function useReplies(
  commentId: string,
  enabled: boolean,
  cached: boolean,
) {
  const [status, setStatus] = useState<GenericStatus>("idle");
  const [data, setData] = useState<CommentReplyType[] | null>(null);
  const { addAlert } = useAlertStore();

  useEffect(() => {
    if (!enabled || cached) return;

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

    fetchReplies();
  }, [commentId, enabled, addAlert, cached]);

  return { data, status };
}
