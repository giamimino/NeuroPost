"use client";
import NotificationsContainer from "@/components/common/containers/Notifications-container";
import renderPostMediaPreview from "@/components/common/renderPostMediaPreview";
import ToggleController from "@/components/common/ToggleController";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import Line from "@/components/ui/Line";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SkeletonArticle,
  SkeletonPosts,
} from "@/components/ui/Skeleton-examples";
import Title from "@/components/ui/title";
import { apiFetch } from "@/lib/apiFetch";
import { useAlertStore } from "@/store/zustand/alert.store";
import { PostsResponse } from "@/types/api-responses";
import { Post } from "@/types/neon";
import { useInfiniteQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { Bell } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const ProfilePage = () => {
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    username: string;
    bio: string | null;
    profile_url: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addAlert } = useAlertStore();
  const hasMoreRef = useRef(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  async function handleFetchPosts(
    pageParam: string | null,
  ): Promise<PostsResponse> {
    if (!user) throw new Error();

    const url = pageParam
      ? `/api/post/u/${user.id}?cursor=${pageParam}&limit=18`
      : `/api/post/u/${user.id}?limit=18`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      throw new Error(data.error.description);
    }

    hasMoreRef.current = data.nextCursor !== null;

    return data;
  }

  const { data, error, isError, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["user-posts", user?.id],
      queryFn: ({ pageParam }) => handleFetchPosts(pageParam),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialPageParam: null as string | null,
    });

  const posts: Post[] = data?.pages.flatMap((page) => page.posts) ?? [];

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
        });
    };
    fetchData();
  }, [addAlert]);

  useEffect(() => {
    const el = loadMoreRef.current;

    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMoreRef.current) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);

    return () => {
      if (el) {
        observer.unobserve(el);
      } else {
        observer.disconnect();
      }
    };
  }, [fetchNextPage]);

  useEffect(() => {
    if (error && isError) {
      addAlert({
        id: crypto.randomUUID(),
        type: "error",
        title: "Error",
        description: error.message,
      });
    }
  }, [error, isError, addAlert]);

  return (
    <div className="pt-32 bg-background">
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
                cursor-pointer rounded-sm w-fit fixed top-17 max-xs:top-20 right-5`}
            size={"sm"}
          >
            <Bell />
          </Button>
        )}
      </ToggleController>
      <div className="flex flex-col items-start gap-1">
        <div className="pl-5.5 w-1/2 max-xs:w-full">
          {loading ? (
            <Skeleton className="w-24 h-24 rounded-full" />
          ) : (
            user?.profile_url && (
              <Image
                src={user!.profile_url}
                width={96}
                height={96}
                alt="user-profile"
                className="rounded-full w-24 h-24 object-cover"
              />
            )
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
          {data ? (
            posts
              .sort(
                (a: any, b: any) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime(),
              )
              .map((post: Post) => (
                <Card
                  className={clsx(
                    "gap-2 overflow-hidden justify-between",
                    post.media ? "py-0" : "pb-0",
                  )}
                  key={post.id}
                >
                  {renderPostMediaPreview({ media: post.media })}
                  <CardContent className="flex flex-col gap-2">
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
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
              ))
          ) : loading ? (
            <SkeletonPosts length={4} />
          ) : (
            posts === null && <CardDescription>No posts found.</CardDescription>
          )}
        </div>
        <div
          ref={loadMoreRef}
          className="w-full min-h-20 gap-8 grid grid-cols-4 mt-5 px-7 max-lg:grid-cols-3 max-lg:mt-3 max-lg:px-5 max-lg:gap-5 max-md:grid-cols-2 max-md:mt-0 max-md:gap-4 max-md:px-3 max-sm:grid-cols-1"
        >
          {isFetchingNextPage && <SkeletonPosts length={4} />}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
