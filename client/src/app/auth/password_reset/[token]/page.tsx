"use client";
import BlurWrapper from "@/components/BlurWrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ApiConfig } from "@/configs/api-configs";
import { ERRORS } from "@/constants/error-handling";
import { useAlertStore } from "@/store/zustand/alertStore";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { use, useEffect, useState } from "react";

export default function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const { addAlert } = useAlertStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) return;

    fetch("/api/send/password_reset/check", {
      ...ApiConfig.post,
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setUser(data.user);
        } else if (!data.ok && data.error) {
          addAlert({
            id: crypto.randomUUID(),
            type: "error",
            ...data.error,
          });
        }
      })
      .catch(() =>
        addAlert({
          id: crypto.randomUUID(),
          type: "error",
          ...ERRORS.GENERIC_ERROR,
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="w-full h-screen justify-center items-center flex">
        <Spinner className="size-10" />
      </div>
    );

  if (!user && !loading)
    return (
      <div className="w-full h-screen flex justify-center items-center p-5">
        <Card
          variant="destructive"
          className="w-full max-w-75 backdrop-blur-lg border border-destructive/50"
        >
          <CardContent className="flex gap-2">
            <CardTitle className="font-normal text-[14px] leading-4.25">
              It looks like you clicked on an invalid password reset link.
              Please try again.
            </CardTitle>
            <button
              onClick={() => router.push("/auth/password_reset")}
              className="text-destructive text-sm cursor-pointer self-start"
            >
              <X width={16} height={16} />
            </button>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div>
      <div className="w-full h-screen flex justify-center items-center">
        <BlurWrapper className="w-full max-w-100">
          <div className="flex flex-col gap-3">
            <CardTitle>Change password for {user?.username}</CardTitle>
            <CardDescription className="text-wrap">
              Make sure it's at least 15 characters OR at least 8 characters
              including a number and a lowercase letter.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <label htmlFor="password" className="text-[14px] font-semibold">
                Password
              </label>
              <Input id="password" />
            </div>
            <div className="flex flex-col gap-3">
              <label
                htmlFor="confirm-password"
                className="text-[14px] font-semibold"
              >
                Confirm password
              </label>
              <Input id="confirm-password" />
            </div>
          </div>
        </BlurWrapper>
      </div>
    </div>
  );
}
