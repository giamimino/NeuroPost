import { Card, CardAction, CardContent } from "@/components/ui/card";
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { NotificationType } from "@/types/neon";

type NotificationCategory = {
  id: string;
  label: string;
};

const notifications_hints = {
  all: { hint: "No Notifications yet." }, 
  "friend_request": { hint: "No Friend requests yet." },
  followers: { hint: "No New followers yet." },
  system: { hint: "No Notifications yet." },
}

const notificationCategories: NotificationCategory[] = [
  { id: "friend_request", label: "Friend Requests" },
  { id: "followers", label: "New Followers" },
  { id: "system", label: "System" },
];

const NotificationsContainer = () => {
  const [select, setSelect] = useState({ id: "friend_request" });
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  const RenderNotificationHint = () => {
    const key = select.id as keyof typeof notifications_hints
    return notifications_hints[key].hint
  }

  const filteredNotifications = useMemo(() => {
    return [];
  }, [select, notifications]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
    >
      <Card className="min-w-100 py-3">
        <CardAction className="px-3">
          <div className="flex gap-2.5">
            {notificationCategories.map((cat) => (
              <Button
                key={cat.id}
                variant={cat.id === select.id ? "outline" : "ghost"}
                onClick={() => setSelect({ id: cat.id })}
                className="cursor-pointer border border-transparent"
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </CardAction>
        <CardContent>
          {filteredNotifications.length === 0 && (
            <p className="text-center">{RenderNotificationHint()}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NotificationsContainer;
