"use client";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { SkeletonUser, SkeletonUsers } from "@/components/ui/Skeleton-examples";
import { apiFetch } from "@/lib/apiFetch";
import { useAlertStore } from "@/store/zustand/alertStore";
import { UserJoin } from "@/types/neon";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const UsersMutedList = () => {
  const [friends, setFriends] = useState<{ id: string; user: UserJoin }[]>([]);
  const [loading, setLoading] = useState(true);
  const { addAlert } = useAlertStore();

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);

      const url = "/api/friends/muted?limit=20";
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
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <CardTitle>Muted list</CardTitle>
      <div className="w-full flex flex-col gap-3">
        {loading ? (
          <SkeletonUsers />
        ) : (
          friends.map((friend) => (
            <div key={friend.id} className="flex gap-2.5 items-center">
              <Image
                src={friend.user.profile_url}
                width={360}
                height={360}
                alt={friend.user.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex flex-col gap-1">
                <CardTitle>{friend.user.name}</CardTitle>
                <CardDescription>{friend.user.username}</CardDescription>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UsersMutedList;
