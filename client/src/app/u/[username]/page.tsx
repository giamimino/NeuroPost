"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Line from "@/components/ui/Line";
import { SkeletonProfile } from "@/components/ui/Skeleton-examples";
import Title from "@/components/ui/title";
import { ApiConfig } from "@/configs/api-configs";
import { ERRORS } from "@/constants/error-handling";
import { apiFetch } from "@/lib/apiFetch";
import { useAlertStore } from "@/store/zustand/alertStore";
import { UserStatsType } from "@/types/global";
import { Post, UserFollowJoinType } from "@/types/neon";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { use, useEffect, useRef, useState } from "react";

const UserPage = ({ params }: { params: Promise<{ username: string }> }) => {
  const { username } = use(params);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    username: string;
    bio: string | null;
    profile_url: string;
    isPrivate: boolean;
    friend_status?: {
      id?: string;
      status: "pending" | "accepted" | "rejected" | "unknown";
    };
    friend_receive?: {
      id: string;
    };
    posts?: Post[];
    follow: UserFollowJoinType;
    stats: UserStatsType;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addAlert } = useAlertStore();
  const tickingRef = useRef(false);

  const handleRequestResponse = async (
    action: "accept" | "reject",
    requestId: string,
  ) => {
    try {
      if (tickingRef.current || !user) return;
      tickingRef.current = true;
      const url = `/api/friend-request/${requestId}`;
      const res = await fetch(url, {
        ...ApiConfig.post,
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (data.ok) {
        setUser((prev) =>
          prev
            ? {
                ...user,
                friend_receive: undefined,
                friend_status: { status: "unknown" },
              }
            : prev,
        );
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

  const handleFollow = async () => {
    if (!user) return;
    const method = user.follow.id ? "delete" : "post";

    const url = "/api/follow";
    const res = await fetch(url, {
      ...ApiConfig[method],
      body: JSON.stringify({
        followId: method === "post" ? user.id : user.follow.id,
      }),
    });
    const data = await res.json();

    if (data.ok) {
      if (method === "post") {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                follow: {
                  id: data.follow.id,
                  created_at: new Date(data.follow.created_at),
                },
                stats: {
                  ...prev.stats,
                  followers: Number(prev.stats.followers) + 1,
                },
              }
            : prev,
        );
      } else if (method === "delete") {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                follow: { id: null, created_at: null },
                stats: {
                  ...prev.stats,
                  followers: Number(prev.stats.followers) - 1,
                },
              }
            : prev,
        );
      }
    } else if (data.error) {
      addAlert({
        ...data.error,
        type: "error",
        id: crypto.randomUUID(),
        duration: 3 * 1000,
      });
    }
  };

  const handleFriendRequest = async () => {
    if (
      !user ||
      user.friend_status?.status === "pending" ||
      user.friend_status?.status === "unknown"
    )
      return;

    const url = `/api/friend-request?withNotif=true`;
    const res = await apiFetch(url, {
      ...ApiConfig.post,
      body: JSON.stringify({ receiverId: user.id }),
    });
    const data = await res?.json();

    if (data.ok) {
      console.log(data);

      setUser((prev) =>
        prev
          ? {
              ...prev,
              friend_status: {
                id: data.friend_request.id,
                status: data.friend_request.status,
              },
            }
          : prev,
      );
    }

    if (!data.ok && data.error) {
      addAlert({ id: crypto.randomUUID(), type: "error", ...data.error });
    }
  };

  const handleCancelFriendRequest = async () => {
    if (
      !user ||
      !user.friend_status ||
      !user.friend_status.id ||
      user.friend_status.status === "unknown" ||
      user.friend_status.status === "accepted"
    )
      return;

    const url = `/api/friend-request?withNotif=true`;
    const res = await apiFetch(url, {
      ...ApiConfig.delete,
      body: JSON.stringify({ requestId: user.friend_status.id }),
    });
    const data = await res?.json();

    if (data.ok) {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              friend_status: undefined,
            }
          : prev,
      );
    }

    if (!data.ok && data.error) {
      addAlert({ id: crypto.randomUUID(), type: "error", ...data.error });
    }
  };

  useEffect(() => {
    if (!username || !addAlert) return;
    const fetchData = async () => {
      setLoading(true);
      apiFetch(`/api/user/${username}?stats=true&friend_status=true`)
        .then((res) => res?.json())
        .then((data) => {
          if (data.ok) {
            setUser(data.user);
          } else if (data.error) {
            addAlert({
              ...data.error,
              id: crypto.randomUUID(),
              type: "error",
              duration: 2.5 * 1000,
            });
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    };
    fetchData();
  }, [addAlert, username]);

  useEffect(() => {
    if (!user || user.posts || user.isPrivate) return;

    (() => {
      apiFetch(`/api/post/u/${user.id}`)
        .then((res) => res?.json())
        .then((data) => {
          if (data.ok) {
            setUser((prev: any) => ({ ...(prev ?? {}), posts: data.posts }));
          }
        });
    })();
  }, [user]);

  return (
    <div className="pt-32">
      <div className="flex flex-col items-start gap-1 px-10 max-lg:px-5">
        {loading ? (
          <SkeletonProfile />
        ) : user ? (
          <div className="flex pl-20 max-md:pl-0 gap-4 max-md:flex-col">
            <Image
              src={user.profile_url}
              width={160}
              height={160}
              alt="user-profile"
              className="rounded-full object-cover w-20.5 h-20.5"
              style={{
                width: "82px",
                height: "82px",
              }}
            />
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                <Title title={user?.name ?? "[name]"} />
                <p className="text-muted-foreground self-center">
                  @{user?.username ?? "[username]"}
                </p>
              </div>
              <div className="flex gap-2">
                {user?.follow && !user.isPrivate && (
                  <Button
                    variant={user?.follow.id ? "outline" : "default"}
                    className={clsx(
                      "cursor-pointer",
                      user?.follow.id
                        ? ""
                        : "bg-btn-secondary text-foreground hover:bg-btn-secondary/60",
                    )}
                    onClick={handleFollow}
                  >
                    {user.follow.id ? "Following" : "Follow"}
                  </Button>
                )}
                {(user?.follow.id || user?.friend_status?.status) &&
                  !user.friend_receive &&
                  user.friend_status?.status !== "unknown" &&
                  user.friend_status?.status !== "accepted" && (
                    <Button
                      variant={"secondary"}
                      onClick={
                        user.friend_status?.status !== "pending"
                          ? handleFriendRequest
                          : handleCancelFriendRequest
                      }
                      className="cursor-pointer text-[14px]"
                    >
                      {user.friend_status?.status === "pending"
                        ? "Cancel request"
                        : "Add Friend"}
                    </Button>
                  )}
                {user && user.friend_receive?.id && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        handleRequestResponse("accept", user.friend_receive!.id)
                      }
                      className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-foreground w-fit"
                    >
                      Confirm
                    </Button>
                    <Button
                      onClick={() =>
                        handleRequestResponse("reject", user.friend_receive!.id)
                      }
                      className="bg-red-600/40 border border-red-600 cursor-pointer hover:bg-red-700/70 text-foreground w-fit"
                    >
                      delete
                    </Button>
                  </div>
                )}
                {user.friend_status?.status === "accepted" && (
                  <CardDescription className="my-auto">
                    Already friends
                  </CardDescription>
                )}
              </div>
              <div className="flex gap-5">
                {user?.stats ? (
                  Object.entries(user.stats).map(([key, value]) => (
                    <div key={`${key}`} className="flex gap-1.5">
                      <CardTitle>{value}</CardTitle>
                      <CardDescription className="cursor-pointer">
                        {`${key.charAt(0).toUpperCase()}${key.slice(1, key.length)}`}
                      </CardDescription>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex gap-1.5">
                      <CardTitle>-</CardTitle>
                      <CardDescription className="cursor-pointer">
                        Following
                      </CardDescription>
                    </div>
                    <div className="flex gap-1.5">
                      <CardTitle>-</CardTitle>
                      <CardDescription className="cursor-pointer">
                        Followers
                      </CardDescription>
                    </div>
                    <div className="flex gap-1.5">
                      <CardTitle>-</CardTitle>
                      <CardDescription className="cursor-pointer">
                        Likes
                      </CardDescription>
                    </div>
                  </>
                )}
              </div>
              <div className="my-3">
                <p className="text-foreground">{user?.bio ?? "No bio yet."}</p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <CardTitle>{ERRORS.USER_NOT_FOUND.title}</CardTitle>
          </div>
        )}
        <Line />
        <div className="w-full gap-8 max-lg:gap-4 max-lg:mt-0 grid grid-cols-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 mt-5">
          {user?.posts?.map((post) => (
            <Card
              className="gap-2 pb-0 overflow-hidden justify-between"
              key={post.id}
            >
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="self-start line-clamp-3">
                  {post.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="bg-card-footer/60 border-t border-card-border">
                <div className="py-2 w-full">
                  <Button
                    variant={"outline"}
                    className="bg-button-bg border border-button-border cursor-pointer w-full"
                    onClick={() => router.push(`/post/${post.id}`)}
                  >
                    View
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
          {user?.isPrivate && (
            <div>
              <CardDescription>Account is private</CardDescription>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPage;
