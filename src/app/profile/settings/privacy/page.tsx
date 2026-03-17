"use client";
import { ToggleSwitch } from "@/components/common/toggle";
import { CardDescription, CardTitle } from "@/components/ui/card";
import React from "react";

const SettingsPrivacyPage = () => {
  const handleTogglePrivateAccount = (value: boolean) => {
    console.log(value);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <CardTitle>Privacy</CardTitle>
      <div className="flex flex-col gap-2 w-full">
        <div className="flex gap-6 justify-between p-2 items-center">
          <CardDescription>Private Account</CardDescription>
          <ToggleSwitch
            className="cursor-pointer"
            onChange={handleTogglePrivateAccount}
          >
            <ToggleSwitch.Track>
              <ToggleSwitch.Thumb />
            </ToggleSwitch.Track>
          </ToggleSwitch>
        </div>
      </div>
    </div>
  );
};

export default SettingsPrivacyPage;
