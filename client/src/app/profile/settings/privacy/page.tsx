"use client";
import { ToggleSwitch } from "@/components/common/toggle";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { ApiConfig } from "@/configs/api-configs";
import { ERRORS } from "@/constants/error-handling";
import { apiFetch } from "@/lib/apiFetch";
import { useAlertStore } from "@/store/zustand/alert.store";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const SettingsPrivacyPage = () => {
  const [isPrivate, setIsPrivate] = useState(false);
  const [privateStatus, setPrivateStatus] = useState<
    "loading" | "error" | "none"
  >("loading");
  const route = useRouter();
  const { addAlert } = useAlertStore();

  const handleTogglePrivateAccount = async (value: boolean) => {
    try {
      if (privateStatus === "error" || privateStatus === "loading") return;
      setPrivateStatus("loading");

      const url = "/api/user/private";
      const res = await apiFetch(url, {
        ...ApiConfig.post,
        body: JSON.stringify({ isPrivate: value }),
      });
      const data = await res?.json();

      if (data.ok) {
        setIsPrivate(value);
      } else if (data.error) {
        addAlert({
          id: crypto.randomUUID(),
          type: "error",
          ...data.error,
        });
      }
    } catch (error) {
      console.error(error);
      addAlert({
        id: crypto.randomUUID(),
        type: "error",
        ...ERRORS.GENERIC_ERROR,
      });
    } finally {
      setPrivateStatus("none");
    }
  };

  useEffect(() => {
    fetch("/api/user/private")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setPrivateStatus("none");
          setIsPrivate(data.isPrivate);
        } else if (data.error) {
          addAlert({ id: crypto.randomUUID(), type: "error", ...data.error });
          setPrivateStatus("error");
        }
      })
      .catch((err) => {
        console.error(err);
        addAlert({
          id: crypto.randomUUID(),
          type: "error",
          ...ERRORS.GENERIC_ERROR,
        });
        setPrivateStatus("error");
      });
  }, [addAlert]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <CardTitle>Privacy</CardTitle>
      <div className="flex flex-col gap-2 w-full">
        <div
          className={clsx(
            "flex gap-6 justify-between p-2 items-center",
            privateStatus === "error"
              ? "pointer-events-none opacity-60 blur-[0.75px]"
              : "opacity-100 blur-none",
          )}
        >
          <div className="flex items-center gap-1">
            <CardDescription>Private Account</CardDescription>
            {privateStatus === "loading" && (
              <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          <ToggleSwitch
            className="cursor-pointer"
            checked={isPrivate}
            onChange={handleTogglePrivateAccount}
          >
            <ToggleSwitch.Track>
              <ToggleSwitch.Thumb />
            </ToggleSwitch.Track>
          </ToggleSwitch>
        </div>
        <div
          onClick={() => route.push("privacy/blocked-list")}
          className="cursor-pointer flex text-muted-foreground justify-between w-full items-center hover:text-foreground group hover:bg-accent p-2 rounded-md"
        >
          <CardDescription className="group-hover:text-foreground">
            Blocked users
          </CardDescription>
          <ChevronRight width={20} height={20} />
        </div>
        <div
          onClick={() => route.push("privacy/muted-list")}
          className="cursor-pointer flex text-muted-foreground justify-between w-full items-center hover:text-foreground group hover:bg-accent p-2 rounded-md"
        >
          <CardDescription className="group-hover:text-foreground">
            Muted users
          </CardDescription>
          <ChevronRight width={20} height={20} />
        </div>
      </div>
    </div>
  );
};

export default SettingsPrivacyPage;
