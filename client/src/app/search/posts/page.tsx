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
import { ERRORS } from "@/constants/error-handling";
import useDebounce from "@/hook/useDebounce";
import { useAlertStore } from "@/store/zustand/alert.store";
import { GenericStatus } from "@/types/global";
import { Post } from "@/types/neon";
import { timeAgo } from "@/utils/functions/timeAgo";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

const SearchPostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState<GenericStatus>("loading");
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 500);
  const { addAlert } = useAlertStore();
  const tickingRef = useRef(false);
  const router = useRouter();
  const [hasMore, setHasMore] = useState<boolean>(false);

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

  const fetchPosts = async (
    query: string,
    limit: number,
    offset: number,
  ): Promise<{ posts: Post[] } | null> => {
    try {
      if (tickingRef.current || !query || !query.trim()) return null;
      setStatus("loading");
      const url = `/api/search/posts?query=${query}&limit=${limit}&offset=${offset}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.ok) {
        setStatus("success");
        setHasMore(data.hasMore)
        return { posts: data.posts };
      } else if (data.error) {
        setStatus("error");
        addAlert({
          id: crypto.randomUUID(),
          type: "error",
          ...data.error,
        });
        return null;
      }

      return null;
    } catch {
      addAlert({
        id: crypto.randomUUID(),
        type: "error",
        ...ERRORS.GENERIC_ERROR,
      });
      setStatus("error");
      return null;
    }
  };

  const loadMore = useCallback(async () => {
    if (!hasMore || status === "loading") return;

    const res = await fetchPosts(debouncedSearch, 12, posts.length);

    if (!res) return;

    setPosts((prev) => [...prev, ...res.posts]);
  }, [hasMore, posts, status, debouncedSearch])

  useEffect(() => {
    fetchPosts(debouncedSearch, 20, 0).then(res => {
      if(!res) return
      setPosts(res.posts)
    })
  }, [debouncedSearch]);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollClient = document.documentElement.clientHeight;
      const target = 0.85;


      if (scrollTop + scrollClient >= scrollHeight * target) {
        loadMore();
      }
    }

    window.addEventListener("scroll", onScroll)

    return () => window.removeEventListener("scroll", onScroll)
  }, [loadMore])

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
        {posts.map((post) => (
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
        ))}

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

      </div>
        {status === "error" && (
          <div className="px-10 my-10 flex justify-center">
            <CardDescription>No more results available.</CardDescription>
          </div>
        )}
    </div>
  );
};

export default SearchPostsPage;
