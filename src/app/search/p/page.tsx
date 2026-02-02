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
import { Spinner } from "@/components/ui/spinner";
import Title from "@/components/ui/title";
import { ApiConfig } from "@/configs/api-configs";
import useDebounce from "@/hook/useDebounce";
import { apiFetch } from "@/lib/apiFetch";
import { Post } from "@/types/neon";
import React, { useEffect, useState } from "react";

const SearchPostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue);

  useEffect(() => {
    const url = `/api/post?limit=4&col=created_at&dir=DESC`;
    apiFetch(url)
      .then((res) => res?.json())
      .then((data) => {
        if (data.ok) {
          setPosts((prev) => [...prev, ...data.posts]);
        }
        setLoading(false);
      });
  }, []);

  async function index() {
    fetch("/api/index")
      .then((res) => res.json())
      .then((data) => console.log(data));
  }

  useEffect(() => {
    index();
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
            className="text-white"
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
              <CardDescription>{post.description}</CardDescription>
            </CardContent>
            <CardFooter className="bg-card-footer/60 border-t border-card-border max-h-15">
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
      <div className="w-full flex justify-center text-white mt-5">
        {loading && <Spinner className="size-12" />}
      </div>
      <Button onClick={() => index()}>fetch</Button>
    </div>
  );
};

export default SearchPostsPage;
