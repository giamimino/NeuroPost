"use client";
import DefaultInput from "@/components/common/DefaultInput";
import DefaultTextarea from "@/components/common/DefaultTextarea";
import DataFetcher from "@/components/data-fetcher";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TagItem } from "@/components/ui/tag";
import Title from "@/components/ui/title";
import { ApiConfig } from "@/configs/api-configs";
import { apiFetch } from "@/lib/apiFetch";
import { Tag } from "@/types/neon";
import { Plus } from "lucide-react";
import React, { useMemo, useRef, useState } from "react";

const PostUploadPage = () => {
  const [tags, setTags] = useState<{ tag: string; id?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const handleUploadPost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true)

      const form = e.currentTarget;
      const formData = new FormData(form);

      const title = formData.get("title") as string;
      const description = formData.get("description") as string | undefined;
      const url = "/api/post";

      if (!title.trim() || (description && !description.trim())) return;

      setLoading(true);
      apiFetch(url, {
        ...ApiConfig.post,
        body: JSON.stringify({ title, description, tags }),
      })
        .then((res) => res?.json())
        .then((data) => {
          console.log(data);
        });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = (tag: string, id?: string) => {
    if (!/^\p{L}+$/u.test(tag) || tags.some((t) => t.tag === tag)) return;
    setTags((prev) => [...(prev ?? []), { tag, id }]);
    tagInputRef.current!.value = "";
  };

  const TagsFetchConfigs = useMemo(() => ApiConfig.dataFetcher, []);

  return (
    <div>
      <div className="flex justify-center w-full mt-35">
        <form
          onSubmit={handleUploadPost}
          className="flex flex-col gap-4.5 max-w-85"
        >
          <div className="text-center">
            <Title title="Upload a post..." font="--font-plusJakartaSans" />
          </div>
          <DefaultInput name="title" placeholder="title" />
          <DefaultTextarea
            name="description"
            placeholder="description"
            cols={8}
          />
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2.5 flex-wrap select-none">
              {!!tags.length &&
                tags.map((tag) => (
                  <TagItem
                    key={`${tag.id}-${tag.tag}`}
                    {...tag}
                    onClick={() => {
                      setTags((prev) => prev.filter((t) => t.tag !== tag.tag));
                    }}
                  />
                ))}
            </CardContent>
            <CardAction className="px-6 flex items-center gap-2.5">
              <Input
                ref={tagInputRef}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    tagInputRef.current &&
                    tagInputRef.current.value
                  ) {
                    handleAddTag(tagInputRef.current.value);
                  }
                }}
              />
              <Button
                type="button"
                size={"sm"}
                variant={"outline"}
                className="cursor-pointer"
                onClick={() => handleAddTag(tagInputRef.current?.value || "")}
              >
                <Plus width={16} height={16} />
              </Button>
            </CardAction>
            <CardFooter className="flex flex-col gap-2.5 items-start">
              <CardTitle>Suggested tags</CardTitle>
              <DataFetcher
                url="/api/tags?dir=ASC&limit=20"
                config={TagsFetchConfigs}
                targetKey={"tags"}
              >
                {(data: Tag[]) => {
                  console.log(data);

                  return (
                    <div className="flex gap-3 flex-wrap select-none">
                      {!!data.length ? (
                        data
                          .filter(
                            (tag) =>
                              !tags.some(
                                (t) => Number(tag.id) === Number(t.id),
                              ),
                          )
                          .map((tag) => (
                            <TagItem
                              id={String(tag.id)}
                              tag={tag.tag}
                              key={`${tag.id}-tag-${tag.tag}`}
                              onClick={() =>
                                handleAddTag(tag.tag, String(tag.id))
                              }
                            />
                          ))
                      ) : (
                        <p>No Tags Found.</p>
                      )}
                    </div>
                  );
                }}
              </DataFetcher>
            </CardFooter>
          </Card>
          <button
            type="button"
            className="text-muted-foreground w-full p-2.5 flex justify-center border border-active-bg rounded-lg cursor-pointer"
          >
            upload a picture
          </button>
          <button
            type="submit"
            className="rounded-md bg-foreground text-secondary-bg py-3 cursor-pointer font-plusJakartaSans font-semibold text-lg tracking-tight hover:bg-foreground/60"
          >
            submit
          </button>
          {loading && (
            <div className="text-center">
              <Title title="loading..." text="--text-base" />
            </div>
          )}
        </form>
      </div>
      <div className="h-50"></div>
    </div>
  );
};

export default PostUploadPage;
