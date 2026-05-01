"use client";
import { ToggleSwitch } from "@/components/common/toggle";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { ApiConfig } from "@/configs/api-configs";
import { ERRORS } from "@/constants/error-handling";
import { apiFetch } from "@/lib/apiFetch";
import { useAlertStore } from "@/store/zustand/alert.store";
import React, { useEffect, useState } from "react";

const $settings = {
  likes_notifications: {
    id: "likes",
    label: "Likes",
    description: "Receive notifications when someone likes your post.",
  },
  comments_notifications: {
    id: "comments",
    label: "Comments",
    description: "Receive notifications when someone comments on your post.",
  },
  new_followers_notifications: {
    id: "new_followers",
    label: "New Followers",
    description: "Receive notifications when someone starts following you.",
  },
  friend_requests_notifications: {
    id: "friend_requests",
    label: "Friend Requests",
    description:
      "Receive notifications when someone sends you a friend request.",
  },
  friend_accepts_notifications: {
    id: "friend_accepts",
    label: "Friend Accepts",
    description:
      "Receive notifications when someone accepts your friend request.",
  },
};

const SettingsNotificationsPage = () => {
  const [settings, setSettings] = useState({
    likes: true,
    comments: true,
    new_followers: true,
    friend_requests: true,
    friend_accepts: true,
  });
  const { addAlert } = useAlertStore();

  const handleChange = async (value: boolean, key: keyof typeof settings) => {
    try {
      const url = `/api/user/settings`;
      const res = await apiFetch(url, {
        ...ApiConfig.post,
        body: JSON.stringify({ key, value: String(value), type: "boolean" }),
      });
      const data = await res?.json();

      if (data.ok) {
        setSettings((prev) => ({ ...prev, [key]: value }));
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

  useEffect(() => {
    const url = `/api/user/settings?category=NOTIFICATIONS_SETTINGS_KEYS`;
    apiFetch(url, ApiConfig.get)
      .then((res) => res?.json())
      .then((data) => {
        if (data.ok) {
          for (const item of data.settings) {
            const key = item.key as keyof typeof $settings;
            const set = $settings[key];
            if (
              Object.keys(settings).includes(set.id) &&
              item.type === "boolean" &&
              Boolean(item.value)
            ) {
              const bool = item.value === "true";

              setSettings((prev) => ({ ...prev, [set.id]: bool }));
            }
          }
        } else if (data?.error) {
          addAlert({ id: crypto.randomUUID(), type: "error", ...data.error });
        }
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addAlert]);

  return (
    <div
      data-lenis-prevent
      className="flex flex-col gap-6 w-full overflow-auto"
    >
      <CardTitle>Notifications</CardTitle>
      <div className="flex flex-col gap-2 w-full">
        {Object.values($settings).map((setting) => (
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
              onChange={(value) => handleChange(value, setting.id as any)}
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
