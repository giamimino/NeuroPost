"use client";
import { ApiConfig } from "@/configs/api-configs";
import { TagType } from "@/types/global";
import { Post } from "@/types/neon";
import React, { use, useEffect, useState } from "react";

const TagsPage = ({ params }: { params: Promise<{ tag: string }> }) => {
  const { tag } = use(params);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<(Post & { tags: TagType[] })[]>([]);

  console.log(posts);
  
  useEffect(() => {
    if (!tag) return;

    const controller = new AbortController();
    const url = `/api/post?tag=${tag}`;
    fetch(url, { ...ApiConfig.get, signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        
        if (data.ok) {
          setPosts((prev) => [...prev, ...data.posts]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [tag]);
  return <div></div>;
};

export default TagsPage;
