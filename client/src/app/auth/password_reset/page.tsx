"use client";
import BlurWrapper from "@/components/BlurWrapper";
import { Button } from "@/components/ui/button";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ERRORS } from "@/constants/error-handling";
import { useAlertStore } from "@/store/zustand/alertStore";
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
      if(!parsedEmail.success) {
        const message = JSON.parse(parsedEmail.error.issues[0].message)

        addAlert({
          id: crypto.randomUUID(),
          type: "error",
          ...message
        })
      }

      const email = parsedEmail.data


    } catch (error) {
      addAlert({
        id: crypto.randomUUID(),
        type: "error",
        ...ERRORS.GENERIC_ERROR,
      });
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
          <Button onClick={handleSendPasswordReset} variant={"outline"} className="cursor-pointer">
            Send password reset email
          </Button>
        </BlurWrapper>
      </div>
    </div>
  );
}
