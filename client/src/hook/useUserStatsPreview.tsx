import { ERRORS } from "@/constants/error-handling";
import { apiFetch } from "@/lib/apiFetch";
import { StatsEndpointType } from "@/schemas/common/enums.schema";
import { useAlertStore } from "@/store/zustand/alert.store";
import { GenericStatus } from "@/types/global";
import { useState, useEffect } from "react";

export default function useUserStatsPreview(
  preview: StatsEndpointType & "none",
  username: string,
  enabled: boolean,
  cached: boolean,
) {
  const [status, setStatus] = useState<GenericStatus>("idle");
  const [data, setData] = useState(null);
  const { addAlert } = useAlertStore();

  useEffect(() => {
    if (!enabled || preview === "none") return;

    const fetchUserStats = async () => {
      try {
        setStatus("loading");

        const res = await apiFetch(
          `/api/user/u/${username}/stats?type=${preview}&limit=20`,
        );
        const data = await res?.json();

        if (data.error) {
          addAlert({
            id: crypto.randomUUID(),
            type: "error",
            ...data.error,
          });
          return;
        }

        const stats = data.stats[preview];

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
  }, [preview, username, enabled, addAlert]);

  return { status, data };
}
