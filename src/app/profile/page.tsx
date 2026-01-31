"use client";
import Line from "@/components/ui/Line";
import Title from "@/components/ui/title";
import { apiFetch } from "@/lib/apiFetch";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    apiFetch("/api/user")
      .then((res) => res?.json())
      .then((data) =>
        setUser({ id: data.user.payload.userId, ...data.user.user }),
      );
  }, []);

  // useEffect(() => {
  //   if(!user || user.posts) return
  //   apiFetch("/api/post")
  //     .then((res) => res?.json())
  //     .then((data) =>
  //       setUser((prev: any) => ({ ...(prev ?? {}), posts: data.posts })),
  //     );
  // }, [user]);

  return (
    <div className="pt-32">
      <div className="flex flex-col items-center gap-1 px-10">
        <Image
          src={"/user.jpg"}
          width={82}
          height={82}
          alt="user-profile"
          className="rounded-full"
        />
        <div className="flex items-end gap-1">
          <Title title={user?.name ?? "[name]"} />
          <p className="text-muted-foreground">
            @{user?.username ?? "[username]"}
          </p>
        </div>
        <div className="my-3">
          <p className="text-foreground">{user?.bio ?? "No bio yet."}</p>
        </div>
        <Line />
      </div>
    </div>
  );
};

export default ProfilePage;
