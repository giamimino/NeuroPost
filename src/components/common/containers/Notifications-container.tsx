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
import { NotificationEnumType, NotificationType } from "@/types/neon";
import { timeAgo } from "@/utils/functions/timeAgo";
import { Dot } from "lucide-react";

type NotificationCategory = {
  id: string;
  label: string;
};

const notifications_hints = {
  all: { hint: "No Notifications yet." },
  friend_request: { hint: "No Friend requests yet." },
  followers: { hint: "No New followers yet." },
  system: { hint: "No Notifications yet." },
};

const notificationCategories: NotificationCategory[] = [
  { id: "friend_request", label: "Friend Requests" },
  { id: "followers", label: "New Followers" },
  { id: "system", label: "System" },
];

const testNotifications: {
  id: string;
  title: string;
  type: NotificationEnumType;
  body: { description?: string; sentAt: Date };
}[] = [
  {
    id: crypto.randomUUID(),
    title: "New Friend Request",
    type: "FRIEND_REQUEST",
    body: {
      description: "sent you a friend request",
      sentAt: new Date(
        Date.now() - Math.floor(Math.random() * 100) * 24 * 60 * 60 * 1000,
      ),
    },
  },
  {
    id: crypto.randomUUID(),
    title: "Friend request declined",
    type: "FRIEND_REQUEST",
    body: {
      description: "declined your friend request.",
      sentAt: new Date(
        Date.now() - Math.floor(Math.random() * 100) * 24 * 60 * 60 * 1000,
      ),
    },
  },
  {
    id: crypto.randomUUID(),
    title: "Friend request accepted",
    type: "FRIEND_REQUEST",
    body: {
      description: "accepted your friend request",
      sentAt: new Date(
        Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000,
      ),
    },
  },
  {
    id: crypto.randomUUID(),
    title: "New Friend Request",
    type: "FRIEND_REQUEST",
    body: {
      description: "sent you a friend request",
      sentAt: new Date(
        Date.now() - Math.floor(Math.random() * 100) * 24 * 60 * 60 * 1000,
      ),
    },
  },
  {
    id: crypto.randomUUID(),
    title: "Friend request declined",
    type: "FRIEND_REQUEST",
    body: {
      description: "declined your friend request.",
      sentAt: new Date(
        Date.now() - Math.floor(Math.random() * 100) * 24 * 60 * 60 * 1000,
      ),
    },
  },
  {
    id: crypto.randomUUID(),
    title: "Friend request accepted",
    type: "FRIEND_REQUEST",
    body: {
      description: "accepted your friend request",
      sentAt: new Date(
        Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000,
      ),
    },
  },
  {
    id: crypto.randomUUID(),
    title: "New Friend Request",
    type: "FRIEND_REQUEST",
    body: {
      description: "sent you a friend request",
      sentAt: new Date(
        Date.now() - Math.floor(Math.random() * 100) * 24 * 60 * 60 * 1000,
      ),
    },
  },
  {
    id: crypto.randomUUID(),
    title: "Friend request declined",
    type: "FRIEND_REQUEST",
    body: {
      description: "declined your friend request.",
      sentAt: new Date(
        Date.now() - Math.floor(Math.random() * 100) * 24 * 60 * 60 * 1000,
      ),
    },
  },
  {
    id: crypto.randomUUID(),
    title: "Friend request accepted",
    type: "FRIEND_REQUEST",
    body: {
      description: "accepted your friend request",
      sentAt: new Date(
        Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000,
      ),
    },
  },
  {
    id: crypto.randomUUID(),
    title: "New Friend Request",
    type: "FRIEND_REQUEST",
    body: {
      description: "sent you a friend request",
      sentAt: new Date(
        Date.now() - Math.floor(Math.random() * 100) * 24 * 60 * 60 * 1000,
      ),
    },
  },
  {
    id: crypto.randomUUID(),
    title: "Friend request declined",
    type: "FRIEND_REQUEST",
    body: {
      description: "declined your friend request.",
      sentAt: new Date(
        Date.now() - Math.floor(Math.random() * 100) * 24 * 60 * 60 * 1000,
      ),
    },
  },
  {
    id: crypto.randomUUID(),
    title: "Friend request accepted",
    type: "FRIEND_REQUEST",
    body: {
      description: "accepted your friend request",
      sentAt: new Date(
        Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000,
      ),
    },
  },
  {
    id: crypto.randomUUID(),
    title: "New Friend Request",
    type: "FRIEND_REQUEST",
    body: {
      description: "sent you a friend request",
      sentAt: new Date(
        Date.now() - Math.floor(Math.random() * 100) * 24 * 60 * 60 * 1000,
      ),
    },
  },
  {
    id: crypto.randomUUID(),
    title: "Friend request declined",
    type: "FRIEND_REQUEST",
    body: {
      description: "declined your friend request.",
      sentAt: new Date(
        Date.now() - Math.floor(Math.random() * 100) * 24 * 60 * 60 * 1000,
      ),
    },
  },
  {
    id: crypto.randomUUID(),
    title: "Friend request accepted",
    type: "FRIEND_REQUEST",
    body: {
      description: "accepted your friend request",
      sentAt: new Date(
        Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000,
      ),
    },
  },
];

const NotificationsContainer = () => {
  const [select, setSelect] = useState({ id: "friend_request" });
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [show, setShow] = useState(6);
  const scrollableContainer = useRef<HTMLDivElement>(null);

  const RenderNotificationHint = () => {
    const key = select.id as keyof typeof notifications_hints;
    return notifications_hints[key].hint;
  };

  const filteredNotifications = useMemo(() => {
    return testNotifications
      .filter((n) => n.type === select.id.toUpperCase())
      .sort((a, b) => b.body.sentAt.getTime() - a.body.sentAt.getTime());
  }, [select, notifications]);

  useEffect(() => {
    const onScroll = () => {
      const window = scrollableContainer.current;
      if (!window) return;
      const scrollTop = window.scrollTop;
      const scrollHeight = window.scrollHeight;
      const scrollClient = window.clientHeight;
      const target = 0.85;

      if (scrollTop + scrollClient >= scrollHeight * target) {
        setShow((prev) => (prev += 3));
      }
    };

    scrollableContainer.current?.addEventListener("scroll", onScroll);

    return () =>
      scrollableContainer.current?.removeEventListener("scroll", onScroll);
  }, []);

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
          ref={scrollableContainer}
          className="px-3 pb-3 flex-1 overflow-y-scroll relative"
        >
          <div className="flex flex-col gap-3">
            {filteredNotifications.length !== 0 ? (
              filteredNotifications.slice(0, show).map((notif) => (
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
                    {timeAgo(notif.body.sentAt)}
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
