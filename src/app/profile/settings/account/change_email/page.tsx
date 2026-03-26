"use client";
import SendCodeButton from "@/components/SendCodeButton";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiConfig } from "@/configs/api-configs";
import { ERRORS } from "@/constants/error-handling";
import { apiFetch } from "@/lib/apiFetch";
import { useAlertStore } from "@/store/zustand/alertStore";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const ChangeEmailSettingPage = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const router = useRouter();
  const { addAlert } = useAlertStore();

  const handleRedirectBack = () => router.push("/profile/settings/account");

  useEffect(() => {
    apiFetch("/api/user")
      .then((res) => res?.json())
      .then((data) => {
        if (data.ok) {
          setUser({ email: data.user.user.email });
        } else if (data.error) {
          addAlert({ id: crypto.randomUUID(), type: "error", ...data.error });
        }
      });
  }, []);

  const handleSend = async () => {
    try {
      if (!user)
        return {
          error: ERRORS.USER_NOT_FOUND,
        };
      const res = await apiFetch("/api/send/code", {
        ...ApiConfig.post,
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res?.json();

      if (data.ok) return { data };
      else if (data.error) return { error: data.error };

      return { error: ERRORS.GENERIC_ERROR };
    } catch (error) {
      return { error: ERRORS.GENERIC_ERROR };
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2 items-center">
        <div
          className="cursor-pointer p-1 hover:bg-accent w-fit rounded-sm"
          onClick={handleRedirectBack}
        >
          <span>
            <ChevronLeft width={20} height={20} />
          </span>
        </div>
        <CardTitle>Change Email</CardTitle>
      </div>
      <div className="w-full max-w-65">
        <div className="flex flex-col gap-2.5">
          {user ? (
            <CardTitle>{user.email}</CardTitle>
          ) : (
            <Skeleton className="w-full h-6" />
          )}
          <div className="flex gap-2">
            <Input placeholder="code..." />
            <SendCodeButton
              handleSend={handleSend}
              variant={"outline"}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeEmailSettingPage;
