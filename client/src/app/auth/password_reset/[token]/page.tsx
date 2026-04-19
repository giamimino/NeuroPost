"use client";
import ActionButton from "@/components/action-button";
import BlurWrapper from "@/components/BlurWrapper";
import { Button } from "@/components/ui/button";
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
import { PasswordValidatorSchema } from "@/schemas/auth/auth.schema";
import { useAlertStore } from "@/store/zustand/alertStore";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { use, useEffect, useRef, useState } from "react";

export default function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const { addAlert } = useAlertStore();
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const passwordConfrimInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handlePasswordChange = async () => {
    try {
      const password = passwordInputRef.current?.value;
      const confrimPassword = passwordConfrimInputRef.current?.value;

      if (!password || !confrimPassword) {
        return { error: ERRORS.REQUIRED_FIELDS };
      }

      const parsedPassword = PasswordValidatorSchema.safeParse(password);

      if (!parsedPassword.success) {
        const message = JSON.parse(parsedPassword.error.issues[0].message);

        return { error: message };
      }

      const $password = parsedPassword.data;

      if ($password !== confrimPassword) {
        return { error: ERRORS.PASSWORDS_DO_NOT_MATCH };
      }

      const res = await fetch("/api/send/password_reset", {
        ...ApiConfig.put,
        body: JSON.stringify({ password: $password }),
      });
      const data = await res.json();

      if (!data.ok) {
        return { error: data.error };
      }

      return { data };
    } catch {
      return { error: ERRORS.GENERIC_ERROR };
    }
  };

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
              <label
                htmlFor="password-field"
                className="text-[14px] font-semibold"
              >
                Password
              </label>
              <Input ref={passwordInputRef} id="password-field" />
            </div>
            <div className="flex flex-col gap-3">
              <label
                htmlFor="confirm-password-field"
                className="text-[14px] font-semibold"
              >
                Confirm password
              </label>
              <Input
                ref={passwordConfrimInputRef}
                id="confirm-password-field"
              />
            </div>
          </div>
          <ActionButton
            onSuccess={() => router.push("/auth/login")}
            onAction={handlePasswordChange}
            className="cursor-pointer py-5 font-medium"
          >
            Change password
          </ActionButton>
        </BlurWrapper>
      </div>
    </div>
  );
}
