"use client";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const ChangePasswordSettingPage = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const router = useRouter();

  const handleSave = () => {};

  const handleCancel = () => {
    setOldPassword("");
    setNewPassword("");
  };

  const handleRedirectBack = () => router.push("/profile/settings/account");

  useEffect(() => {
    const onChange = () => {
      if (
        oldPassword !== "" &&
        newPassword !== "" &&
        oldPassword !== newPassword
      )
        setIsChanged(true);
      else if (isChanged) setIsChanged(false);
    };
    onChange();
  }, [oldPassword, newPassword]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2 items-center">
        <div
          className="cursor-pointer p-1 hover:bg-accent w-fit rounded-sm"
          onClick={handleRedirectBack}
        >
          <span>
            <ChevronLeft width={20} height={20} />
          </span>
        </div>
        <CardTitle>Change Password</CardTitle>
      </div>
      <div className="flex flex-col gap-3 max-w-64">
        <div className="flex flex-col gap-3">
          <CardTitle>Old Password</CardTitle>
          <Input
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-3">
          <CardTitle>New Password</CardTitle>
          <Input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="flex gap-3 font-plusJakartaSans justify-end">
          <Button
            onClick={handleCancel}
            variant={"secondary"}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant={!isChanged ? "disabled" : "destructive"}
            className={`${isChanged ? "cursor-pointer" : ""}`}
            onClick={isChanged ? handleSave : undefined}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordSettingPage;
