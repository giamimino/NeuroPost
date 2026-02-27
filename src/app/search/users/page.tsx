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

const SearchUsersPage = () => {
  const [users, setUsers] = useState<
    { name: string; username: string; id: string; bio: string | null }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue);
  const router = useRouter();

  useEffect(() => {
    if (!debouncedSearch) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/search/u", {
          ...ApiConfig.post,
          body: JSON.stringify({ query: debouncedSearch }),
        });
        if (!res.ok) return;

        const data = await res.json();
        setUsers(data.users);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
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
        {users.map((user) => (
          <Card
            className="w-1/4 gap-2 pb-0 overflow-hidden justify-between"
            key={user.id}
          >
            <CardHeader>
              <CardTitle>{user.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className=" line-clamp-3">
                {user.bio}
              </CardDescription>
            </CardContent>
            <CardFooter className="">
              <div className="py-2 w-full">
                <Button
                  variant={"outline"}
                  className="w-full cursor-pointer"
                  onClick={() => router.push(`/u/${user.username}`)}
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

export default SearchUsersPage;
