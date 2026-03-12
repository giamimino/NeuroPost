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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SkeletonFriendRequest,
  SkeletonFriendRequests,
} from "@/components/ui/Skeleton-examples";
import { ApiConfig } from "@/configs/api-configs";
import { ERRORS } from "@/constants/error-handling";
import { apiFetch } from "@/lib/apiFetch";
import { useAlertStore } from "@/store/zustand/alertStore";
import { FriendRequestType, FriendType } from "@/types/neon";
import { timeAgo } from "@/utils/functions/timeAgo";
import {
  EllipsisVertical,
  MessageCircle,
  MessageCircleMore,
  MessageCircleOff,
  UserRoundPlus,
  UserRoundX,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

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
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<FriendType[]>([]);
  const { addAlert } = useAlertStore();
  const router = useRouter();
  const tickingRef = useRef(false);

  const handleDeleteFriend = async (friendId: string) => {
    try {
      const controller = new AbortController();
      const res = await apiFetch("/api/friends/friend", {
        ...ApiConfig.delete,
        signal: controller.signal,
        body: JSON.stringify({ friendId }),
      });
      const data = await res?.json();

      if (data.ok) {
        setFriends((prev) => prev.filter((p) => p.id !== friendId));
      } else if (data.error) {
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

  const handleRequestResponse = async (
    action: "accept" | "reject",
    requestId: string,
  ) => {
    try {
      if (tickingRef.current) return;
      tickingRef.current = true;
      const url = `/api/friend-request/${requestId}`;
      const res = await fetch(url, {
        ...ApiConfig.post,
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (data.ok) {
        setFriendRequests((prev) => prev.filter((p) => p.id !== requestId));
      } else if (data.error) {
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
      tickingRef.current = false;
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
              }
            : {
                url: "/api/friends?limit=20",
                request: ApiConfig.get,
              };

        const res = await apiFetch(config.url, config.request);
        const data = await res?.json();

        if (data.ok) {
          if (section === "friend_requests") {
            setFriendRequests(data.friend_requests);
          } else if (section == "all_friends") {
            setFriends(data.friends);
          }
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
                    <div>{page.icon}</div>
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
          ) : section === "friend_requests" ? (
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
          ) : (
            friends.map((f) => (
              <Card key={f.id} className="p-0 gap-0">
                <CardContent className="px-0 flex flex-col">
                  <Image
                    src={f.user.profile_url}
                    width={320}
                    height={320}
                    alt={f.user.name}
                    className="object-cover w-full aspect-7/5 rounded-t-xl"
                  />
                  <div className="p-3 flex justify-between items-center">
                    <div>
                      <CardTitle
                        className="cursor-pointer"
                        onClick={() => router.push(`/u/${f.user.username}`)}
                      >
                        {f.user.name}
                      </CardTitle>
                      <CardDescription>
                        {timeAgo(new Date(f.created_at))}
                      </CardDescription>
                    </div>
                    <div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant={"ghost"}
                            size={"sm"}
                            className="cursor-pointer"
                          >
                            <EllipsisVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>
                            <Button
                              variant={"destructive"}
                              className="cursor-pointer w-full"
                            >
                              <div>
                                <MessageCircleMore />
                              </div>
                              message
                            </Button>
                          </DropdownMenuLabel>
                          <DropdownMenuLabel>
                            <Button
                              variant={"outline"}
                              className="cursor-pointer w-full"
                            >
                              <div>
                                <MessageCircleOff />
                              </div>
                              mute
                            </Button>
                          </DropdownMenuLabel>

                          <DropdownMenuLabel>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className="cursor-pointer w-full"
                                >
                                  <div>
                                    <UserRoundX />
                                  </div>
                                  unfriend
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <div className="p-3 flex flex-col gap-3">
                                  <div>
                                    <CardDescription>
                                      {`Are you sure you want to unfriend ${f.user.username}?`}
                                    </CardDescription>
                                  </div>
                                  <div className="flex gap-3">
                                    <DropdownMenuItem asChild>
                                      <Button
                                        variant={"outline"}
                                        size={"md"}
                                        className="cursor-pointer px-3"
                                        onClick={() => handleDeleteFriend(f.id)}
                                      >
                                        Yes
                                      </Button>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                      <Button
                                        variant={"ghost"}
                                        size={"md"}
                                        className="cursor-pointer px-3"
                                      >
                                        cancel
                                      </Button>
                                    </DropdownMenuItem>
                                  </div>
                                </div>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </DropdownMenuLabel>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
                <CardAction className="flex flex-col w-full gap-3 px-3 pb-3"></CardAction>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
