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
import { Spinner } from "@/components/ui/spinner";
import Title from "@/components/ui/title";
import { ApiConfig } from "@/configs/api-configs";
import useDebounce from "@/hook/useDebounce";
import { apiFetch } from "@/lib/apiFetch";
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
    const url = `/api/post?limit=4&col=created_at&dir=DESC`;

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
  }, []);

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
      <div className="w-full flex flex-wrap gap-8 px-10 justify-center mt-10">
        {posts.map((post) => (
          <Card
            className="w-1/4 gap-2 pb-0 overflow-hidden justify-between"
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
      <div className="w-full flex justify-center flex-wrap gap-8 text-white mt-5 px-20">
        {loading && (
          <>
            {Array.from({ length: 4 })
              .fill("")
              .map((_, index) => (
                <div key={index} className="w-2/7">
                  <SkeletonPost />
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPostsPage;
