"use client";
import NotificationsContainer from "@/components/common/containers/Notifications-container";
import ToggleController from "@/components/common/ToggleController";
import { ProfileNavigation } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import React from "react";

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex w-full">
      <div className="py-20 pl-4 h-full max-md:w-1/2 max-lg:w-1/3 w-1/4 sticky top-0">
        <ProfileNavigation />
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
};

export default ProfileLayout;
