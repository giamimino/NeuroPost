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
import { SkeletonCard } from "@/components/ui/Skeleton-examples";
import { Spinner } from "@/components/ui/spinner";
import Title from "@/components/ui/title";
import { ApiConfig } from "@/configs/api-configs";
import { Post, UserJoin } from "@/types/neon";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { use, useEffect, useState } from "react";

const Route = ({ params }: { params: Promise<{ postId: number }> }) => {
  const { postId } = use(params);
  const router = useRouter()
  const [post, setPost] = useState<Post & UserJoin | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!postId) return;

    const url = `/api/post?id=${postId}`;
    fetch(url, ApiConfig.get)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setPost(data.posts[0]);
        }
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);
  return (
    <div className="pt-25">
      <div className="flex items-center justify-center w-full">
        {loading ? (
          <div className="w-1/2">
            <SkeletonCard />
          </div>
        ) : (
          <Card
            className={`w-1/2 gap-0 ${!post?.image ? "pb-0 overflow-hidden" : ""}`}
          >
            <CardHeader>
              <CardTitle className="text-2xl">
                {post?.title ?? "[title]"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{post?.description}</CardDescription>
              <div>
                <button className="text-foreground cursor-pointer hover:underline" onClick={() => router.push(`/u/${post?.username}`)}>
                  @{post?.name}
                </button>
              </div>
            </CardContent>
            {!post?.image && (
              <CardFooter className="px-0 mt-10">
                <img
                  src={
                    "https://i.pinimg.com/736x/32/e1/fb/32e1fb59b631107f6f45307ccab219dc.jpg"
                  }
                  className="w-full object-cover max-h-150 rounded-xl"
                />
              </CardFooter>
            )}
          </Card>
        )}
      </div>
      <div className="h-50"></div>
    </div>
  );
};

export default Route;
