"use client";
import { CardDescription, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SkeletonUser } from "@/components/ui/Skeleton-examples";
import { Spinner } from "@/components/ui/spinner";
import { ApiConfig } from "@/configs/api-configs";
import { ERRORS } from "@/constants/error-handling";
import { apiFetch } from "@/lib/apiFetch";
import { useAlertStore } from "@/store/zustand/alertStore";
import { UserJoin } from "@/types/neon";
import { ChevronLeft, EllipsisVertical } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const UsersBlockedList = () => {
  const [friends, setFriends] = useState<{ id: string; user: UserJoin }[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendLoading, setFriendLoading] = useState<string | null>(null);
  const { addAlert } = useAlertStore();
  const router = useRouter();

  const handleUnblockFriend = async (friendshipId: string) => {
    try {
      setFriendLoading(friendshipId);
      const url = `/api/friends/blocked`;
      const res = await apiFetch(url, {
        ...ApiConfig.post,
        body: JSON.stringify({ friendship_id: friendshipId, blocked: false }),
      });
      const data = await res?.json();

      if (data.ok) {
        setFriends((prev) => prev.filter((p) => p.id !== friendshipId));
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
      setFriendLoading(null);
    }
  };

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);

      const url = "/api/friends/blocked?limit=20";
      apiFetch(url)
        .then((res) => res?.json())
        .then((data) => {
          if (data.ok) {
            setFriends(data.friends);
          } else if (data.error) {
            addAlert({ id: crypto.randomUUID(), type: "error", ...data.error });
          }
        })
        .finally(() => setLoading(false));
    };

    fetchData();
  }, [addAlert]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2 items-center">
        <div
          className="cursor-pointer p-1 hover:bg-accent w-fit rounded-sm"
          onClick={() => router.push("/profile/settings/privacy")}
        >
          <ChevronLeft width={20} height={20} />
        </div>
        <CardTitle>Blocked List</CardTitle>
      </div>
      <div className="w-full flex flex-col gap-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <SkeletonUser key={`skeleton-user-${i}`} />
            ))
          : friends.map((friend) => (
              <div
                key={friend.id}
                className="flex gap-2.5 items-center justify-between"
              >
                <div className="flex gap-2.5 items-center">
                  <Image
                    src={friend.user.profile_url}
                    width={360}
                    height={360}
                    alt={friend.user.username}
                    className="w-12 h-12 max-md:w-8 max-md:h-8 rounded-full object-cover"
                  />
                  <div className="flex flex-col gap-1">
                    <CardTitle className="max-md:text-xs">
                      {friend.user.name}
                    </CardTitle>
                    <CardDescription className="max-md:text-xs">
                      {friend.user.username}
                    </CardDescription>
                  </div>
                  {friendLoading === friend.id && (
                    <div>
                      <Spinner />
                    </div>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="cursor-pointer max-md:scale-75">
                      <EllipsisVertical width={24} height={24} />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleUnblockFriend(friend.id)}
                      className="cursor-pointer font-semibold"
                    >
                      <p>unblock</p>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
      </div>
    </div>
  );
};

export default UsersBlockedList;
