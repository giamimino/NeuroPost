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
import { apiFetch } from "@/lib/apiFetch";
import { Post } from "@/types/neon";
import Image from "next/image";
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
  } | null>(null);
  useEffect(() => {
    apiFetch(`/api/user/${username}`)
      .then((res) => res?.json())
      .then((data) => {
        if (data.ok) {
          setUser(data.user[0]);
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
        <div className="flex w-full gap-8 flex-wrap justify-center mt-5">
          {user?.posts?.map((post) => (
            <Card className="w-1/4 gap-2 pb-0 overflow-hidden justify-between" key={post.id}>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="self-start">{post.description}</CardDescription>
              </CardContent>
              <CardFooter className="bg-card-footer/60 border-t border-card-border">
                <div className="py-2 w-full">
                  <Button
                    variant={"outline"}
                    className="bg-button-bg border border-button-border cursor-pointer w-full"
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
