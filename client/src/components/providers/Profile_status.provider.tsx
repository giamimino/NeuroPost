"use client";
import { ERRORS } from "@/constants/error-handling";
import { useAlertStore } from "@/store/zustand/alert.store";
import { useProfileStatusStore } from "@/store/zustand/profile_status.store";
import { ProfileStatusStoreType } from "@/types/zustand.store";
import { useEffect } from "react";

const ProfileStatusProvider = () => {
  const { setData } = useProfileStatusStore();
  const { addAlert } = useAlertStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/user/profile/status");
        const data = await res.json();

        if (data.ok) {
          const normalizedData = {
            hasNewNotifications: data.data.hasNewNotifications[0].exists,
          } as ProfileStatusStoreType["data"];

          setData(normalizedData);
        } else {
          addAlert({
            type: "error",
            id: crypto.randomUUID(),
            ...(data.error || ERRORS.GENERIC_ERROR),
          });
        }
      } catch (error) {
        console.error(error);

        addAlert({
          type: "error",
          id: crypto.randomUUID(),
          ...ERRORS.GENERIC_ERROR,
        });
      }
    };

    fetchData();
  }, [addAlert, setData]);

  return null;
};

export default ProfileStatusProvider;
