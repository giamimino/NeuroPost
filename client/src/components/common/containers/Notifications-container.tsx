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
import { ChevronRight, Circle } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NotificationCategory = {
  id: string;
  label: string;
};

const notifications_hints = {
  all: { hint: "No Notifications yet." },
  friend_request: { hint: "No Friend requests yet." },
  new_follower: { hint: "No New followers yet." },
  system: { hint: "No Notifications yet." },
  new_message: { hint: "No New Messages yet." },
  new_post: { hint: "No New Posts in your feed yet." },
  new_like: { hint: "No New Likes yet." },
  friend_accept: { hint: "No Accepted Friend Requests yet." },
  friend_decline: { hint: "No Declined Friend Requests yet." },
};

const notificationCategories: (NotificationCategory & {
  more?: NotificationCategory[];
  isMore: boolean;
})[] = [
  { id: "all", label: "All", isMore: false },
  { id: "new_like", label: "New Likes", isMore: false },
  { id: "new_post", label: "Feed", isMore: false },
  {
    id: "friend_request_with_more",
    label: "Friend Requests",
    isMore: true,
    more: [
      { id: "friend_request", label: "Pending" },
      { id: "friend_accept", label: "Accepted" },
      { id: "friend_decline", label: "Declined" },
    ],
  },
  { id: "new_follower", label: "New Followers", isMore: false },
  { id: "new_message", label: "Messages", isMore: false },
  { id: "system", label: "System", isMore: false },
];

const NotificationsContainer = () => {
  const [select, setSelect] = useState({
    id: "all",
    label: "All",
  });
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollableContainer = useRef<HTMLDivElement>(null);
  const { addAlert } = useAlertStore();

  const getNotifCat = (id: string) => {
    return notificationCategories.find((n) => n.id === id);
  };

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
        setNotifications(
          data.notifications.sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          ),
        );
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
      className="z-99 fixed right-5 max-xs:right-3"
    >
      <Card className="w-100 max-xs:w-85 max-h-[75vh] pt-3 pb-0 flex flex-col">
        <CardAction className="px-3">
          <div className="flex gap-2.5 relative z-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"} className="cursor-pointer">
                  {select.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="relative z-100">
                {notificationCategories.map((n) =>
                  n.isMore ? (
                    <DropdownMenu key={n.id}>
                      <DropdownMenuTrigger asChild>
                        <Button variant={"ghost"} className="cursor-pointer">
                          <p>{n.label}</p>
                          <ChevronRight />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="relative z-101">
                        {n.more?.map((m) => (
                          <DropdownMenuItem
                            className="cursor-pointer px-3 py-2"
                            onClick={() =>
                              setSelect({ id: m.id, label: m.label })
                            }
                            key={m.id}
                          >
                            {m.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <DropdownMenuItem
                      className="cursor-pointer px-3 py-2"
                      onClick={() => setSelect({ id: n.id, label: n.label })}
                      key={n.id}
                    >
                      {n.label}
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
                  <CardContent className="px-3 max-w-9/10">
                    <CardTitle className="text-[16px]">{notif.title}</CardTitle>
                    <CardDescription>{notif.body.description}</CardDescription>
                  </CardContent>
                  <CardFooter className="px-3 mt-0">
                    {timeAgo(new Date(notif.created_at))}
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
