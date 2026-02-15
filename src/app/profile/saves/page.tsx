"use client";
import { Card, CardHeader } from "@/components/ui/card";
import Line from "@/components/ui/Line";
import clsx from "clsx";
import { Heart, MessageCircle } from "lucide-react";
import React, { useState } from "react";

const ActivitySections = [
  { label: "Likes", icon: <Heart width={15} /> },
  {
    label: "Comments",
    icon: <MessageCircle width={15} className="-scale-x-100" />,
  },
];

const ProfileSavesPage = () => {
  const [section, setSection] = useState<"likes" | "comments">("likes");
  return (
    <div className="pt-20 px-5">
      <Card className="w-full py-3">
        <CardHeader className="gap-0">
          <div className="flex gap-5 justify-center">
            {ActivitySections.map((item) => (
              <div
                key={`${item.label}`}
                className={`
                flex font-plusJakartaSans uppercase tracking-wider text-xs items-center font-medium flex-1 justify-center
              `}
              >
                <button
                  className={clsx(
                    "flex gap-2.5 items-center cursor-pointer hover:opacity-80 border-b pb-1.5",
                    "transition duration-300 ease-initial border-transparent",
                    section === item.label.toLowerCase()
                      ? "border-white"
                      : "opacity-60",
                  )}
                  onClick={() =>
                    setSection(item.label.toLowerCase() as typeof section)
                  }
                >
                  {item.icon}
                  {item.label}
                </button>
              </div>
            ))}
          </div>
          <Line />
        </CardHeader>
      </Card>
    </div>
  );
};

export default ProfileSavesPage;
