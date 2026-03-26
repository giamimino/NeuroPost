"use client";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
            <Button variant={"outline"} className="cursor-pointer">
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeEmailSettingPage;
