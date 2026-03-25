"use client";
import { CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const ChangeEmailSettingPage = () => {
  const router = useRouter();

  const handleRedirectBack = () => router.push("/profile/settings/account");

  return (
    <div>
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
    </div>
  );
};

export default ChangeEmailSettingPage;
