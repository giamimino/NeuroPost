"use client"
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import React from "react";

const pages: {
  url: string;
  label: string;
  variant:
    | "ghost"
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary";
}[] = [
  { url: "/profile/p/create", label: "Upload", variant: "default" },
  { url: "/profile", label: "Profile", variant: "ghost" },
  { url: "/profile/saves", label: "Saves", variant: "ghost" },
  { url: "/profile/edit", label: "Edit", variant: "ghost" },
  { url: "/profile/settings", label: "Settings", variant: "ghost" },
];

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  return (
    <div className="flex w-full">
      <div className="py-20 pl-4 h-full w-1/4">
        <Card className="">
          <CardHeader>
            <CardTitle>Menu</CardTitle>
          </CardHeader>
          <div>
            <nav>
              {pages.map((page) => (
                <Button
                  variant={page.variant}
                  key={`${page.label}`}
                  className="w-full rounded-none cursor-pointer"
                  onClick={() => router.push(page.url)}
                >
                  {page.label}
                </Button>
              ))}
            </nav>
          </div>
        </Card>
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
};

export default ProfileLayout;
