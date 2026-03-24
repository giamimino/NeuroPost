"use client";
import NotificationsContainer from "@/components/common/containers/Notifications-container";
import ToggleController from "@/components/common/ToggleController";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  SkeletonArticle,
  SkeletonPosts,
} from "@/components/ui/Skeleton-examples";
import Title from "@/components/ui/title";
import { ApiConfig } from "@/configs/api-configs";
import { apiFetch } from "@/lib/apiFetch";
import { useAlertStore } from "@/store/zustand/alertStore";
import { Post } from "@/types/neon";
import { Bell } from "lucide-react";
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
    profile_url: string | null;
  } | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addAlert } = useAlertStore();

  const handleViewPost = (id: number) => {
    router.push(`/post/${id}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      apiFetch("/api/user")
        .then((res) => res?.json())
        .then((data) => {
          if (data.error) {
            addAlert({ id: crypto.randomUUID(), type: "error", ...data.error });
          } else if (data.ok) {
            setUser({ id: data.user.payload.userId, ...data.user.user });
          }
        })
        .finally(() => setLoading(false));
    };
    fetchData();
  }, [addAlert]);

  useEffect(() => {
    if (!user?.profile_url) return;

    fetch("/api/r2/image", {
      ...ApiConfig.post,
      body: JSON.stringify({ image_url: user.profile_url }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setSignedUrl(data.profileImage);
        }
      });
  }, [user]);

  return (
    <div className="pt-32 bg-background">
      <div className="absolute top-17 max-xs:top-20 z-99 right-5">
        <ToggleController
          className="gap-2.5"
          animatePresence
          whatToShow={() => <NotificationsContainer />}
        >
          {({ setShow }) => (
            <Button
              variant={"none"}
              onClick={() => setShow((prev) => !prev)}
              className={`border bg-secondary 
                shadow-xs hover:bg-accent hover:text-accent-foreground 
                 dark:border-input dark:hover:brightness-115 
                cursor-pointer rounded-sm w-fit self-end`}
              size={"sm"}
            >
              <Bell />
            </Button>
          )}
        </ToggleController>
      </div>
      <div className="flex flex-col items-start gap-1">
        <div className="pl-5.5 w-1/2 max-xs:w-full">
          {loading ? (
            <Skeleton className="w-24 h-24 rounded-full" />
          ) : signedUrl ? (
            <Image
              src={signedUrl}
              width={96}
              height={96}
              alt="user-profile"
              className="rounded-full w-24 h-24 object-cover"
            />
          ) : (
            <Image
              src={"/user.jpg"}
              width={96}
              height={96}
              alt="user-profile"
              className="rounded-full w-24 h-24 object-cover"
            />
          )}
          {user ? (
            <>
              <div className="flex items-end gap-1 max-md:gap-0 w-full max-xs:flex-col max-xs:items-start">
                <Title title={user.name} />
                <p className="text-muted-foreground">@{user.username}</p>
              </div>
              <div className="my-3 max-xs:w-full">
                <p className="text-foreground">{user?.bio ?? "No bio yet."}</p>
              </div>
            </>
          ) : (
            <SkeletonArticle className="mt-5" />
          )}
        </div>
        <Line />
        <div className="w-full gap-8 grid grid-cols-4 mt-5 px-7 max-lg:grid-cols-3 max-lg:mt-3 max-lg:px-5 max-lg:gap-5 max-md:grid-cols-2 max-md:mt-0 max-md:gap-4 max-md:px-3 max-sm:grid-cols-1">
          <DataFetcher
            url={`/api/post/u/${user?.id}`}
            config={{ ...ApiConfig.get, enabled: user !== null }}
            targetKey="posts"
            loadingUI={<SkeletonPosts length={5} />}
          >
            {(posts: Post[]) => (
              <>
                {posts.map((post) => (
                  <Card
                    className="gap-2 pb-0 overflow-hidden justify-between"
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
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
