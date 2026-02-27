"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { TagItem } from "@/components/ui/tag";
import { ApiConfig } from "@/configs/api-configs";
import { Tag } from "@/types/neon";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const TagsPage = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const url = `/api/tags?limit=66&dir=DESC`;
    fetch(url, { ...ApiConfig.get, signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setTags(data.tags);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="pt-20">
      <div className="w-full flex flex-col items-center gap-5 mt-7.5">
        <div>
          <CardTitle className="text-xl">Explore tags</CardTitle>
        </div>
        <div className="flex flex-wrap justify-center gap-5 w-full px-10">
          {tags.map((tag) => (
            <Card key={tag.id} className="text-center w-50">
              <div className="px-6">
                <TagItem
                  tag={`#${tag.tag}`}
                  variant="none"
                  onClick={() => router.push(`/tags/${tag.tag}`)}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TagsPage;
