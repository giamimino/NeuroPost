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
import { Input } from "@/components/ui/input";
import { SkeletonPost } from "@/components/ui/Skeleton-examples";
import Title from "@/components/ui/title";
import { ApiConfig } from "@/configs/api-configs";
import useDebounce from "@/hook/useDebounce";
import { useAlertStore } from "@/store/zustand/alert.store";
import { GenericStatus } from "@/types/global";
import { Post } from "@/types/neon";
import { timeAgo } from "@/utils/functions/timeAgo";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const SearchPostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState<GenericStatus>("loading");
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 500);
  const { addAlert } = useAlertStore();
  const tickingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const url = `/api/post?limit=6&col=created_at&dir=DESC`;

    (async () => {
      try {
        const res = await fetch(url, { ...ApiConfig.get, signal });
        const data = await res?.json();
        if (data.ok) {
          setPosts(() => data.posts);
        }
        setStatus("success");
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("Fetch Aborted");
        } else {
          console.error(error);
        }
      }
    })();

    return () => controller.abort();
  }, []);

  const fetchPosts = async (query: string, limit: number) => {
    if (tickingRef.current || !query || !query.trim()) return;

    const url = `/api/search/posts?query=${query}&limit=${limit}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(data);
    

    if (data.ok) {
      // setPosts(data.posts);
    } else if (data.error) {
      addAlert({
        id: crypto.randomUUID(),
        type: "error",
        ...data.error,
      });
    }
  };

  useEffect(() => {
    fetchPosts(debouncedSearch, 20)
  }, [debouncedSearch]);

  return (
    <div className="w-full pt-32">
      <div className="w-full flex justify-center">
        <div className="max-w-100 flex flex-col items-center gap-2">
          <Title title="Search For Posts" />
          <Input
            className="text-foreground"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>
      <div className="w-full grid grid-cols-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-8 px-10 justify-center mt-10">
        {status === "loading" && (
          <>
            {Array.from({ length: 6 })
              .fill("")
              .map((_, index) => (
                <div key={index}>
                  <SkeletonPost />
                </div>
              ))}
          </>
        )}
        {/* {posts.map((post) => (
          <Card
            className="gap-1.5 pb-0 overflow-hidden justify-between"
            key={post.id}
          >
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
            </CardHeader>
            <CardContent className="gap-2">
              <CardDescription className=" line-clamp-3">
                {post.description}
              </CardDescription>
              <CardDescription>
                {timeAgo(new Date(post.created_at))}
              </CardDescription>
            </CardContent>
            <CardFooter>
              <div className="pb-2 w-full">
                <Button
                  variant={"outline"}
                  className="w-full cursor-pointer"
                  onClick={() => router.push(`/post/${post.id}`)}
                >
                  View
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))} */}
      </div>
    </div>
  );
};

export default SearchPostsPage;
