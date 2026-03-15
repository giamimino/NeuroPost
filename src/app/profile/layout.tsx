"use client";
import { ProfileNavigation } from "@/components/header";
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
