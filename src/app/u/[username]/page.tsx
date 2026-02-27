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
import Title from "@/components/ui/title";
import { ApiConfig } from "@/configs/api-configs";
import { apiFetch } from "@/lib/apiFetch";
import { UserStatsType } from "@/types/global";
import { Post, UserFollowJoinType } from "@/types/neon";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { use, useEffect, useState } from "react";

const UserPage = ({ params }: { params: Promise<{ username: string }> }) => {
  const { username } = use(params);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    username: string;
    bio: string | null;
    posts?: Post[];
    follow: UserFollowJoinType;
    stats: UserStatsType
  } | null>(null);
  const router = useRouter();

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
              }
            : prev,
        );
      } else if (method === "delete") {
        setUser((prev) =>
          prev ? { ...prev, follow: { id: null, created_at: null } } : prev,
        );
      }
    }
  };

  useEffect(() => {
    apiFetch(`/api/user/${username}?stats=true`)
      .then((res) => res?.json())
      .then((data) => {
        if (data.ok) {
          setUser(data.user);
        }
      });
  }, []);

  useEffect(() => {
    if (!user || user.posts) return;

    apiFetch(`/api/post/u/${user.id}`)
      .then((res) => res?.json())
      .then((data) => {
        if (data.ok) {
          setUser((prev: any) => ({ ...(prev ?? {}), posts: data.posts }));
        }
      });
  }, [user]);

  console.log(user);
  

  return (
    <div className="pt-32">
      <div className="flex flex-col items-start gap-1 px-10">
        <div className="flex pl-20 gap-4">
          <Image
            src={"/user.jpg"}
            width={82}
            height={82}
            alt="user-profile"
            className="rounded-full object-cover w-20.5 h-20.5"
          />
          <div className="flex flex-col gap-1">
            <div className="flex gap-1">
              <Title title={user?.name ?? "[name]"} />
              <p className="text-muted-foreground">
                @{user?.username ?? "[username]"}
              </p>
            </div>
            <div>
              {user?.follow && (
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
            </div>
            <div className="flex gap-5">
              {user?.stats && Object.entries(user.stats).map(([key, value]) => (
                <div key={`${key}`} className="flex gap-1.5">
                  <CardTitle>
                    {value}
                  </CardTitle>
                  <CardDescription className="cursor-pointer">
                    {`${key.charAt(0).toUpperCase()}${key.slice(1, key.length)}`}
                  </CardDescription>
                </div>
              ))}
            </div>
            <div className="my-3">
              <p className="text-foreground">{user?.bio ?? "No bio yet."}</p>
            </div>
          </div>
        </div>
        <Line />
        <div className="flex w-full gap-8 flex-wrap justify-center mt-5">
          {user?.posts?.map((post) => (
            <Card
              className="w-1/4 gap-2 pb-0 overflow-hidden justify-between"
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
        </div>
      </div>
    </div>
  );
};

export default UserPage;
