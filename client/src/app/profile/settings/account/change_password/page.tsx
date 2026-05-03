"use client";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ApiConfig } from "@/configs/api-configs";
import { ERRORS } from "@/constants/error-handling";
import { apiFetch } from "@/lib/apiFetch";
import { useAlertStore } from "@/store/zustand/alert.store";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const ChangePasswordSettingPage = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { addAlert } = useAlertStore();
  const router = useRouter();

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/user/change_password", {
        ...ApiConfig.post,
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res?.json();

      if (data.error)
        addAlert({ id: crypto.randomUUID(), type: "error", ...data.error });
      if (data.ok) {
        setIsSuccess(true);
        setOldPassword("");
        setNewPassword("");
        setIsChanged(false);
      }
    } catch {
      addAlert({
        id: crypto.randomUUID(),
        type: "error",
        ...ERRORS.GENERIC_ERROR,
      });
    } finally {
      setLoading(false);
    }
  };

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oldPassword, newPassword]);

  useEffect(() => {
    if (!isSuccess) return;

    const timer = setTimeout(() => setIsSuccess(false), 2000);

    return () => clearTimeout(timer);
  }, [isSuccess]);

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
        <div className="flex justify-end">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-3 font-plusJakartaSans">
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
                onClick={isChanged && !loading ? handleSave : undefined}
              >
                {loading ? <Spinner /> : <span>Save</span>}
              </Button>
            </div>
            {isSuccess && <CardDescription>Password changed!</CardDescription>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordSettingPage;
