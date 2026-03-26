"use client";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApiConfig } from "@/configs/api-configs";
import { ERRORS } from "@/constants/error-handling";
import { apiFetch } from "@/lib/apiFetch";
import { useAlertStore } from "@/store/zustand/alertStore";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const SettingsAccountPage = () => {
  const [accountStatus, setAccountStatus] = useState<
    "pending" | "active" | "deleted" | "unknown"
  >("active");
  const { addAlert } = useAlertStore();
  const router = useRouter();

  const handleDeleteAccount = async () => {
    setAccountStatus("pending");

    const url = "/api/user";
    const res = await apiFetch(url, ApiConfig.delete);
    const data = await res?.json();

    if (data.ok) {
      setAccountStatus("deleted");
    } else if (data.error) {
      addAlert({ id: crypto.randomUUID(), type: "error", ...data.error });
      setAccountStatus("unknown");
    } else {
      setAccountStatus("active");
    }
  };

  const handleRedirect = (page: string) => {
    router.push(`/profile/settings/account/${page}`);
  };

  const handleLogout = async () => {
    try {
      const url = "/api/auth/logout";
      const res = await apiFetch(url, ApiConfig.post);
      const data = await res?.json();

      if (data.ok) {
        router.push("/");
      } else if (data.error) {
        addAlert({ id: crypto.randomUUID(), type: "error", ...data.error });
      }
    } catch {
      addAlert({
        id: crypto.randomUUID(),
        type: "error",
        ...ERRORS.GENERIC_ERROR,
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <CardTitle>Account</CardTitle>
      <div className="flex flex-col gap-2 w-full">
        <div
          onClick={() => handleRedirect("/change_email")}
          className="cursor-pointer flex text-muted-foreground justify-between w-full items-center hover:text-foreground group hover:bg-accent p-2 rounded-md"
        >
          <CardDescription className="group-hover:text-foreground">
            Change Email Address
          </CardDescription>
          <ChevronRight width={20} height={20} />
        </div>
        <div
          onClick={() => handleRedirect("/change_password")}
          className="cursor-pointer flex text-muted-foreground justify-between w-full items-center hover:text-foreground group hover:bg-accent p-2 rounded-md"
        >
          <CardDescription className="group-hover:text-foreground">
            Change Password
          </CardDescription>
          <ChevronRight width={20} height={20} />
        </div>
        <div
          onClick={handleLogout}
          className="cursor-pointer flex text-muted-foreground gap-2.5 w-full items-center group hover:bg-destructive/10 p-2 rounded-md"
        >
          <CardDescription className="group-hover:text-destructive">
            Logout Account
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="cursor-pointer flex text-muted-foreground gap-2.5 w-full items-center group hover:bg-destructive/10 p-2 rounded-md">
              {accountStatus === "active" ? (
                <CardDescription className="group-hover:text-destructive">
                  Delete Account
                </CardDescription>
              ) : accountStatus === "pending" ? (
                <>
                  <CardDescription>Loading</CardDescription>
                  <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : accountStatus === "deleted" ? (
                <CardDescription>This account deleted</CardDescription>
              ) : null}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="flex flex-col gap-2.5 p-2.5">
              <CardDescription>
                Are you sure you want to delete account?
              </CardDescription>
              <div className="flex gap-2.5">
                <DropdownMenuItem className="p-0" onClick={handleDeleteAccount}>
                  <Button variant={"outline"} className="cursor-pointer">
                    Yes
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-0">
                  <Button variant={"ghost"} className="cursor-pointer">
                    cancel
                  </Button>
                </DropdownMenuItem>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default SettingsAccountPage;
