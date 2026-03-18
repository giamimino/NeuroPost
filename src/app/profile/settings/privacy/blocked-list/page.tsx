"use client";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const UsersBlockedList = () => {
  const router = useRouter();

  return (
    <div>
      <div className="flex gap-2 items-center">
        <div
          className="cursor-pointer p-1 hover:bg-accent w-fit rounded-sm"
          onClick={() => router.push("/profile/settings/privacy")}
        >
          <ChevronLeft width={20} height={20} />
        </div>
        <CardTitle>Blocked List</CardTitle>
      </div>
    </div>
  );
};

export default UsersBlockedList;
