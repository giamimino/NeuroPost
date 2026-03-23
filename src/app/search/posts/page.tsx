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
import { Post } from "@/types/neon";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const SearchPostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue);
  const router = useRouter();

  useEffect(() => {
    if (posts.length !== 0) return;
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
        setLoading(false);
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("Fetch Aborted");
        } else {
          console.error(error);
        }
      }
    })();

    return () => controller.abort();
  }, [posts.length]);

  useEffect(() => {
    if (!debouncedSearch) return;
    (async () => {
      const res1 = await fetch("/api/search", {
        ...ApiConfig.post,
        body: JSON.stringify({ query: debouncedSearch }),
      });
      if (!res1.ok) return;

      const data1 = await res1.json();
      const sortPosts = Object.entries(
        data1.result as Record<string, number>,
      ).sort((a, b) => b[1] - a[1]);
      if (sortPosts.length === 0) return;
      const res2 = await fetch(`/api/search?ids=${sortPosts}`);
      if (!res2.ok) return;
      const result = await res2.json();
      if (result.posts.length === 0) return;
      console.log(result);

      setPosts(result.posts);
    })();
  }, [debouncedSearch, posts.length]);

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
        {loading && (
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
            <CardFooter>
              <div className="py-2 w-full">
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
      </div>
    </div>
  );
};

export default SearchPostsPage;
