"use client";
import ActionButton from "@/components/action-button";
import BlurWrapper from "@/components/BlurWrapper";
import { Button } from "@/components/ui/button";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApiConfig } from "@/configs/api-configs";
import { ERRORS } from "@/constants/error-handling";
import { useAlertStore } from "@/store/zustand/alertStore";
import fakeFetch from "@/utils/functions/fakeFetch";
import React, { useRef } from "react";
import z from "zod";

export default function PasswordResetConfrimationPage() {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const { addAlert } = useAlertStore();

  const handleSendPasswordReset = async () => {
    try {
      const parsedEmail = z
        .email(JSON.stringify(ERRORS.EMAIL_REQUIRED))
        .safeParse(emailInputRef.current?.value);
      if (!parsedEmail.success) {
        const message = JSON.parse(parsedEmail.error.issues[0].message);
        return { error: message };
      }

      const email = parsedEmail.data;

      const res = await fetch("/api/send/password_reset", {
        ...ApiConfig.post,
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!data.ok) {
        return { error: data.error };
      }

      return data;
    } catch (error) {
      console.log(error);

      return { error: ERRORS.GENERIC_ERROR };
    }
  };

  return (
    <div>
      <div className="w-full h-screen flex justify-center items-center">
        <BlurWrapper className="w-full max-w-100">
          <div className="flex flex-col gap-3">
            <CardTitle>Reset your password</CardTitle>
            <CardDescription className="text-wrap">
              Enter your user account's verified email address and we will send
              you a password reset link.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-3">
            <label htmlFor="email_field" className="text-[14px] font-semibold">
              Email
            </label>
            <Input
              ref={emailInputRef}
              id="email_field"
              placeholder="Enter your email address"
            />
          </div>
          <ActionButton
            onAction={handleSendPasswordReset}
            variant={"outline"}
            className="cursor-pointer"
          >
            Send password reset email
          </ActionButton>
        </BlurWrapper>
      </div>
    </div>
  );
}
