"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  SkeletonFriendRequest,
  SkeletonFriendRequests,
} from "@/components/ui/Skeleton-examples";
import { ApiConfig } from "@/configs/api-configs";
import { ERRORS } from "@/constants/error-handling";
import { apiFetch } from "@/lib/apiFetch";
import { useAlertStore } from "@/store/zustand/alertStore";
import { FriendRequestType } from "@/types/neon";
import { timeAgo } from "@/utils/functions/timeAgo";
import { UserRoundPlus, UsersRound } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const pages = [
  {
    id: "friend_requests",
    label: "Friend Requests",
    icon: <UserRoundPlus />,
  },
  {
    id: "all_friends",
    label: "All friends",
    icon: <UsersRound />,
  },
];

const FriendsPage = () => {
  const [section, setSection] = useState("friend_requests");
  const [friendRequests, setFriendRequests] = useState<FriendRequestType[]>([]);
  const { addAlert } = useAlertStore();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequestResponse = async (
    action: "accept" | "reject",
    requestId: string,
  ) => {
    try {
      const url = `/api/friend-request/${requestId}`;
      const res = await fetch(url, {
        ...ApiConfig.patch,
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (data.ok && data.error) {
        addAlert({ id: crypto.randomUUID(), type: "error", ...data.error });
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
      try {
        setLoading(true);
        const config =
          section === "friend_requests"
            ? {
                url: "/api/friend-request?limit=20",
                request: ApiConfig.get,
                target: "friend_requests",
                setState: setFriendRequests,
              }
            : {
                url: "",
                request: ApiConfig.get,
                target: "",
                setState: setFriendRequests,
              };

        const res = await apiFetch(config.url, config.request);
        const data = await res?.json();
        if (data.ok) {
          config.setState(data[config.target]);
        } else if (!data.ok && data.error) {
          addAlert({ id: crypto.randomUUID(), type: "error", ...data.error });
        }
      } catch (error) {
        console.error(error);
        addAlert({
          id: crypto.randomUUID(),
          type: "error",
          ...ERRORS.GENERIC_ERROR,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [section]);

  return (
    <div className="w-full pt-25 pl-5">
      <div className="flex">
        <div className="max-w-50 w-full">
          <Card className="py-4">
            <div className="px-4">
              <CardTitle>Friends</CardTitle>
            </div>
            <div>
              <nav className="flex flex-col gap-2">
                {pages.map((page) => (
                  <Button
                    variant={"ghost"}
                    key={`${page.label}`}
                    className={`w-full rounded-none cursor-pointer justify-start`}
                    onClick={() => setSection(page.id)}
                  >
                    <Button
                      size={"icon-xs"}
                      className="rounded-sm"
                      variant={"secondary"}
                    >
                      {page.icon}
                    </Button>
                    <p
                      className={
                        page.id === section
                          ? "text-current font-bold"
                          : "text-current/90"
                      }
                    >
                      {page.label}
                    </p>
                  </Button>
                ))}
              </nav>
            </div>
          </Card>
        </div>
        <div className="grid grid-cols-4 w-full gap-5 px-5">
          {loading ? (
            <SkeletonFriendRequests length={8} />
          ) : (
            friendRequests.map((fr) => (
              <Card key={fr.id} className="p-0 gap-0">
                <CardContent className="px-0 flex flex-col">
                  <Image
                    src={fr.user.profile_url}
                    width={320}
                    height={320}
                    alt={fr.user.name}
                    className="object-cover w-full aspect-7/5 rounded-t-xl"
                  />
                  <div className="p-3">
                    <CardTitle
                      className="cursor-pointer"
                      onClick={() => router.push(`/u/${fr.user.username}`)}
                    >
                      {fr.user.name}
                    </CardTitle>
                    <CardDescription>
                      {timeAgo(new Date(fr.created_at))}
                    </CardDescription>
                  </div>
                </CardContent>
                <CardAction className="flex flex-col w-full gap-3 px-3 pb-3">
                  <Button
                    onClick={() => handleRequestResponse("accept", fr.id)}
                    className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-foreground"
                  >
                    Confirm
                  </Button>
                  <Button
                    onClick={() => handleRequestResponse("reject", fr.id)}
                    className="w-full cursor-pointer"
                    variant={"outline"}
                  >
                    delete
                  </Button>
                </CardAction>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
