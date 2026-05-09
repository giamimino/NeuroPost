import { ERRORS } from "@/constants/error-handling";
import { apiFetch } from "@/lib/apiFetch";
import { useAlertStore } from "@/store/zustand/alert.store";
import { GenericStatus, StatsPreviewType } from "@/types/global";
import { UserStatsPreviewUserType } from "@/types/neon";
import { useState, useEffect, useRef } from "react";

export default function useUserStatsPreview(
  type: Lowercase<StatsPreviewType>,
  username: string,
  enabled: boolean,
  cached: boolean,
) {
  const [status, setStatus] = useState<GenericStatus>("idle");
  const [data, setData] = useState<
    (UserStatsPreviewUserType & { likes_count?: string })[] | null
  >(null);
  const { addAlert } = useAlertStore();
  const tickingRef = useRef(false)

  useEffect(() => {
    if (!enabled) return;

    const fetchUserStats = async () => {
      try {
        if(tickingRef.current) return
        tickingRef.current = true
        setStatus("loading");
        const url = `/api/user/u/${username}/stats?type=${type.toUpperCase()}&limit=8`;
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

        const stats = data.stats[type];

        if (!stats) {
          addAlert({
            id: crypto.randomUUID(),
            type: "error",
            ...ERRORS.GENERIC_ERROR,
          });

          return;
        }

        setData(stats);
        setStatus("success");
        tickingRef.current = false
      } catch (error) {
        setStatus("error");
        addAlert({
          id: crypto.randomUUID(),
          type: "error",
          ...ERRORS.GENERIC_ERROR,
        });
      }
    };

    fetchUserStats();
  }, [type, username, enabled, addAlert]);

  return { status, data };
}
