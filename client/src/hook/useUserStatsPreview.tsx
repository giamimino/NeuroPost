import { ERRORS } from "@/constants/error-handling";
import { apiFetch } from "@/lib/apiFetch";
import { useAlertStore } from "@/store/zustand/alert.store";
import { GenericStatus, StatsPreviewType } from "@/types/global";
import { UserStatsPreviewUserType } from "@/types/neon";
import { useState, useEffect, useRef, useCallback } from "react";

type User = UserStatsPreviewUserType & {
  likes_count?: string;
  created_at: string;
};

export default function useUserStatsPreview(
  type: Lowercase<StatsPreviewType>,
  username: string,
  enabled: boolean,
) {
  const [status, setStatus] = useState<GenericStatus>("idle");
  const [data, setData] = useState<User[]>([]);
  const { addAlert } = useAlertStore();

  const cacheRef = useRef(new Map<string, User[]>());
  const hasMoreRef = useRef(true);
  const tickingRef = useRef(false);

  const cursor = data ? data[0].created_at : new Date().toISOString();
  const key = `${username}:${type}`;

  const reset = () => {
    setData([]);
    hasMoreRef.current = true;
    tickingRef.current = false;
  };

  const fetchUserStats = useCallback(
    async (append: boolean) => {
      try {
        if (tickingRef.current || !enabled) return;
        if (!hasMoreRef.current && append) return;
        tickingRef.current = true;
        setStatus("loading");
        const url = `/api/user/u/${username}/stats?type=${type.toUpperCase()}&limit=8&cursor=${cursor}`;
        const res = await apiFetch(url);
        const data = await res?.json();

        if (data.error) {
          addAlert({
            id: crypto.randomUUID(),
            type: "error",
            ...data.error,
          });
          return;
        }
        const stats = data?.stats?.[type] ?? [];

        if (!append) {
          setData(stats);
        } else {
          setData((prev) => [...prev, ...stats]);
        }

        cacheRef.current.set(
          key,
          append ? [...(cacheRef.current.get(key) ?? []), ...stats] : stats,
        );

        hasMoreRef.current = data.hasMore;

        setStatus("success");
      } catch (error) {
        setStatus("error");
        addAlert({
          id: crypto.randomUUID(),
          type: "error",
          ...ERRORS.GENERIC_ERROR,
        });
      } finally {
        tickingRef.current = false;
      }
    },
    [username, type, addAlert, key, cursor, enabled],
  );

  useEffect(() => {
    if (!enabled) return;

    const cached = cacheRef.current.get(key);

    if (cached?.length) {
      setData(cached);
      setStatus("success");
      return;
    }

    reset();
    fetchUserStats(false);
  }, [fetchUserStats, enabled, reset, key]);

  const loadMore = useCallback(() => {
    if(!enabled) return;
    fetchUserStats(true)
  }, [fetchUserStats, enabled])

  return { status, data, loadMore, hasMore: hasMoreRef.current };
}
