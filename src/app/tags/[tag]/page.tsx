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
import { SkeletonPosts } from "@/components/ui/Skeleton-examples";
import { TagItem } from "@/components/ui/tag";
import { ApiConfig } from "@/configs/api-configs";
import { TagType } from "@/types/global";
import { Post } from "@/types/neon";
import { useRouter } from "next/navigation";
import React, { use, useEffect, useState } from "react";

const TagPage = ({ params }: { params: Promise<{ tag: string }> }) => {
  const { tag } = use(params);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<(Post & { tags: TagType[] })[]>([]);
  const router = useRouter();

  const handleViewPost = (id: number) => {
    router.push(`/post/${id}`);
  };

  useEffect(() => {
    setLoading(true)
    const url = `/api/post?tag=${tag}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setPosts(data.posts);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="pt-20">
      <div className="flex items-center w-full flex-col gap-5 mt-7.5">
        <div>
          <CardTitle className="text-xl">All #{tag} posts</CardTitle>
        </div>
          {loading && <SkeletonPosts length={5} className="grid sm:grid-cols-2 lg:grid-cols-3 px-10" postClassName="w-auto" />}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full px-10 ">
          {posts.map((post) => (
            <Card
              key={`${post.id}-${post.author_id}-${post.created_at}`}
              className=" gap-0 pb-0 overflow-hidden"
            >
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {post.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2.5 flex-wrap pt-0 mt-auto max-h-15">
                {post.tags.map((tag) => (
                  <TagItem
                    key={`${tag.id}-${tag.tag}-${post.id}`}
                    tag={`#${tag.tag}`}
                    variant="none"
                  />
                ))}
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
        </div>
      </div>
    </div>
  );
};

export default TagPage;
