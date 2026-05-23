import { ERRORS } from "@/constants/error-handling";
import { apiFetch } from "@/lib/apiFetch";
import { useAlertStore } from "@/store/zustand/alert.store";
import { UserStatsPreviewContextType } from "@/types/context";
import { GenericStatus, StatsPreviewType } from "@/types/global";
import { UserStatsPreviewUserType } from "@/types/neon";
import { useState, useEffect, useRef, useCallback } from "react";

type User = UserStatsPreviewUserType & {
  likes_count?: string;
};

export default function useUserStatsPreview(
  type: Lowercase<StatsPreviewType>,
  username: string,
  enabled: boolean,
  cacheRef: UserStatsPreviewContextType["cacheRef"],
) {
  const [status, setStatus] = useState<GenericStatus>("idle");
  const [data, setData] = useState<User[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const { addAlert } = useAlertStore();

  const tickingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const loadMoreRef = useRef<() => Promise<any> | null>(null);

  const key = `${username}:${type}`;

  const reset = () => {
    setData([]);
    setHasMore(true);

    tickingRef.current = false;
    hasMoreRef.current = true;
  };

  const fetchUserStats = useCallback(async (append: boolean) => {
    if (tickingRef.current || !enabled) return;
    if (!hasMoreRef.current && append) return;

    tickingRef.current = true;

    if (!append) setStatus("loading");

    const cursor =
      append && data.length
        ? data[data.length - 1].created_at
        : new Date().toISOString();

    try {
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

      setHasMore(data.hasMore);

      setStatus("success");
    } catch {
      setStatus("error");
      addAlert({
        id: crypto.randomUUID(),
        type: "error",
        ...ERRORS.GENERIC_ERROR,
      });
    } finally {
      tickingRef.current = false;
    }
  }, [addAlert, cacheRef, data, enabled, key, type, username]);

  useEffect(() => {
    if (!enabled) return;
    if (tickingRef.current) return;

    const cached = cacheRef.current.get(key);

    if (cached && cached.length > 0) {
      setData(cached);
      setStatus("success");
      return;
    }

    reset();
    fetchUserStats(false);
  }, [enabled, key, cacheRef, fetchUserStats]);

  useEffect(() => {
    loadMoreRef.current = async () => {
      if (!enabled) return;
      if (tickingRef.current) return;

      await fetchUserStats(true);
    };
  }, [enabled, fetchUserStats]);

  return { status, data, loadMore: () => loadMoreRef.current?.(), hasMore };
}
