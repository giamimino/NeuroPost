import BlurWrapper from "@/components/BlurWrapper";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import React from "react";

export default function ForgotPasswordPage() {
  return (
    <div>
      <div className="w-full h-screen flex justify-center items-center">
        <BlurWrapper className="w-full max-w-100">
          <div className="flex flex-col gap-3">
            <CardTitle>Change password for @giamimino</CardTitle>
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
              <label htmlFor="confirm-password" className="text-[14px] font-semibold">
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
