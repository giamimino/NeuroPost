import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { NotificationType } from "@/types/neon";
import { timeAgo } from "@/utils/functions/timeAgo";
import { Circle } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import { SkeletonNotifications } from "@/components/ui/Skeleton-examples";
import { useAlertStore } from "@/store/zustand/alertStore";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ERRORS } from "@/constants/error-handling";
import { ApiConfig } from "@/configs/api-configs";

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
  const [loading, setLoading] = useState(false);
  const scrollableContainer = useRef<HTMLDivElement>(null);
  const { addAlert } = useAlertStore();

  const RenderNotificationHint = () => {
    const key = select.id as keyof typeof notifications_hints;
    return notifications_hints[key].hint;
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const url = `/api/notifications/read`;
      const res = await apiFetch(url, {
        ...ApiConfig.post,
        body: JSON.stringify({ notificationId: id }),
      });
      const data = await res?.json();

      if (data.ok) {
        setNotifications((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isread: true } : p)),
        );
      } else if (!data.ok && data.error) {
        addAlert({
          id: crypto.randomUUID(),
          type: "error",
          ...data.error,
          duration: 3 * 1000,
        });
      }
    } catch (error) {
      console.error(error);
      addAlert({
        id: crypto.randomUUID(),
        type: "error",
        ...ERRORS.GENERIC_ERROR,
      });
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const url = `/api/notifications?type=${select.id}&limit=20`;
      const res = await apiFetch(url);
      const data = await res?.json();
      if (data.ok) {
        console.log("data", data);
        setNotifications(data.notifications);
      } else if (!data.ok && data.error) {
        addAlert({ id: crypto.randomUUID(), type: "error", ...data.error });
      }
      setLoading(false);
    })();
  }, [select, addAlert]);

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
            {loading ? (
              <SkeletonNotifications length={5} />
            ) : notifications.length !== 0 ? (
              notifications.map((notif) => (
                <Card
                  key={notif.id}
                  variant={notif.isread ? "default" : "secondary"}
                  className="py-3 rounded-lg gap-2 relative select-none hover:brightness-115"
                >
                  {!notif.isread && (
                    <HoverCard openDelay={10} closeDelay={100}>
                      <HoverCardTrigger
                        asChild
                        className="absolute right-5 cursor-pointer top-1/2 -translate-y-1/2"
                        onClick={() => handleMarkAsRead(notif.id)}
                      >
                        <Circle width={10} height={10} fill="#fff" />
                      </HoverCardTrigger>
                      <HoverCardContent className="z-99 text-center max-w-50 mt-2">
                        Mark as Read
                      </HoverCardContent>
                    </HoverCard>
                  )}
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
