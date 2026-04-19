"use client"
import { CardDescription, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const SettingsSecurityPage = () => {
  const router = useRouter()
  return (
    <div className="flex flex-col gap-6 w-full">
      <CardTitle>Security</CardTitle>
      <div className="flex flex-col gap-2 w-full">
        <div
          onClick={() => router.push("/auth/password_reset")}
          className="cursor-pointer flex text-muted-foreground justify-between w-full items-center hover:text-foreground group hover:bg-accent p-2 rounded-md"
        >
          <CardDescription className="group-hover:text-foreground">
            Forgot Password
          </CardDescription>
          <ChevronRight width={20} height={20} />
        </div>
      </div>
    </div>
  );
};

export default SettingsSecurityPage;
