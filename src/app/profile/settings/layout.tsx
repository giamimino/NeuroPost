"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import React from "react";

const pages = {
  profile: { label: "Profile", id: "profile" },
  account: { label: "Account", id: "account" },
  security: { label: "Security", id: "security" },
  notifications: { label: "Notifications", id: "notifications" },
  privacy: { label: "Privacy", id: "privacy" },
  appearance: { label: "Appearance", id: "appearance" },
};

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  return (
    <div className="pt-20 px-5">
      <Card className="h-[80vh] p-0">
        <div className="flex h-full">
          <CardFooter className="border-r py-4 px-0 flex flex-col h-full">
            <CardTitle className="text-xl border-b px-4 pb-4">
              settings
            </CardTitle>
            <div className="flex flex-col px-1.5 py-2.5">
              {Object.values(pages).map((page) => (
                <Button
                  key={page.id}
                  variant={"ghost"}
                  className="cursor-pointer"
                  onClick={() => router.push(`${page.id}`)}
                >
                  {page.label}
                </Button>
              ))}
            </div>
          </CardFooter>
          <CardContent className="p-6 flex flex-col gap-6 w-full">
            {children}
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default SettingsLayout;
