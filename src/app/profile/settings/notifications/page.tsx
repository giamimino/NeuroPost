"use client";
import { ToggleSwitch } from "@/components/common/toggle";
import { CardDescription, CardTitle } from "@/components/ui/card";
import React, { useState } from "react";

const $settings = [
  {
    id: "likes",
    label: "Likes",
    description: "Receive notifications when someone likes your post.",
  },
  {
    id: "comments",
    label: "Comments",
    description: "Receive notifications when someone comments on your post.",
  },
  {
    id: "new_followers",
    label: "New Followers",
    description: "Receive notifications when someone starts following you.",
  },
  {
    id: "friend_requests",
    label: "Friend Requests",
    description:
      "Receive notifications when someone sends you a friend request.",
  },
  {
    id: "friend_accepts",
    label: "Friend Accepts",
    description:
      "Receive notifications when someone accepts your friend request.",
  },
];

const SettingsNotificationsPage = () => {
  const [settings, setSettings] = useState({
    likes: false,
    comments: false,
    new_followers: false,
    friend_requests: false,
    friend_accepts: false,
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      <CardTitle>Notifications</CardTitle>
      <div className="flex flex-col gap-2 w-full">
        {$settings.map((setting) => (
          <div
            key={setting.id}
            className="cursor-pointer flex text-muted-foreground justify-between w-full items-center hover:text-foreground group hover:bg-accent p-2 rounded-md"
          >
            <div className="flex flex-col gap-0.5">
              <CardDescription className="group-hover:text-foreground">
                {setting.label}
              </CardDescription>
              <CardDescription className="group-hover:opacity-100 opacity-50">
                {setting.description}
              </CardDescription>
            </div>
            <ToggleSwitch
              className="cursor-pointer"
              checked={settings[setting.id as keyof typeof settings]}
              onChange={(value) =>
                setSettings((prev) => ({ ...prev, [setting.id]: value }))
              }
            >
              <ToggleSwitch.Track>
                <ToggleSwitch.Thumb />
              </ToggleSwitch.Track>
            </ToggleSwitch>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsNotificationsPage;
