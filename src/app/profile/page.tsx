"use client";
import DataFetcher from "@/components/data-fetcher";
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
import { SkeletonPost } from "@/components/ui/Skeleton-examples";
import Title from "@/components/ui/title";
import { apiFetch } from "@/lib/apiFetch";
import { Post } from "@/types/neon";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const ProfilePage = () => {
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    username: string;
    bio: string | null;
  } | null>(null);
  const router = useRouter();

  const handleViewPost = (id: number) => {
    router.push(`/post/${id}`);
  };

  useEffect(() => {
    apiFetch("/api/user")
      .then((res) => res?.json())
      .then((data) =>
        setUser({ id: data.user.payload.userId, ...data.user.user }),
      );
  }, []);

  return (
    <div className="pt-32 bg-background">
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
          {user?.id && (
            <DataFetcher url={`/api/post/u/${user.id}`} targetKey="posts" loadingUI={<SkeletonPost className="w-1/4" />}>
              {(posts: Post[]) => (
                <>
                  {posts.map((post) => (
                    <Card
                      className="w-1/4 gap-2 pb-0 overflow-hidden"
                      key={post.id}
                    >
                      <CardHeader>
                        <CardTitle>{post.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className=" line-clamp-3">
                          {post.description}
                        </CardDescription>
                      </CardContent>
                      <CardFooter className="bg-card-footer/60 border-t border-card-border max-h-15">
                        <div className="py-2 w-full">
                          <Button
                            variant={"outline"}
                            onClick={() => handleViewPost(post.id)}
                            className="bg-button-bg border border-button-border cursor-pointer w-full"
                          >
                            View
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </>
              )}
            </DataFetcher>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
