import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { NotificationType } from "@/types/neon";
import { timeAgo } from "@/utils/functions/timeAgo";
import { Dot } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonNotifications } from "@/components/ui/Skeleton-examples";

type NotificationCategory = {
  id: string;
  label: string;
};

const notifications_hints = {
  all: { hint: "No Notifications yet." },
  friend_request: { hint: "No Friend requests yet." },
  new_follower: { hint: "No New followers yet." },
  system: { hint: "No Notifications yet." },
};

const notificationCategories: NotificationCategory[] = [
  { id: "friend_request", label: "Friend Requests" },
  { id: "new_follower", label: "New Followers" },
  { id: "system", label: "System" },
];

const NotificationsContainer = () => {
  const [select, setSelect] = useState({ id: "friend_request" });
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(false)
  const scrollableContainer = useRef<HTMLDivElement>(null);

  const RenderNotificationHint = () => {
    const key = select.id as keyof typeof notifications_hints;
    return notifications_hints[key].hint;
  };

  useEffect(() => {
    setLoading(true)
    const url = `/api/notifications?type=${select.id}&limit=20`;
    apiFetch(url)
      .then((res) => res?.json())
      .then((data) => {
        if (data.ok) {
          console.log("data", data);
          setNotifications(data.notifications);
        }
      }).finally(() => setLoading(false))
  }, [select]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
    >
      <Card className="min-w-100 max-h-[75vh] pt-3 pb-0 flex flex-col ">
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
        <div
          data-lenis-prevent
          ref={scrollableContainer}
          className="px-3 pb-3 flex-1 overflow-y-auto relative"
        >
          <div className="flex flex-col gap-3">
            {loading ? <SkeletonNotifications length={5} /> : notifications.length !== 0 ? (
              notifications.map((notif) => (
                <Card
                  key={notif.id}
                  variant="secondary"
                  className="py-3 rounded-lg gap-2 relative cursor-pointer select-none hover:brightness-115"
                >
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Dot width={48} height={48} />
                  </div>
                  <CardContent className="px-3">
                    <CardTitle className="text-[16px]">{notif.title}</CardTitle>
                    <CardDescription>{notif.body.description}</CardDescription>
                  </CardContent>
                  <CardFooter className="px-3 mt-0">
                    {timeAgo(new Date(notif.body.sentAt))}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p className="text-center">{RenderNotificationHint()}</p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default NotificationsContainer;
