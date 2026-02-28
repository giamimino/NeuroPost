"use client";
import DefaultTextarea from "@/components/common/DefaultTextarea";
import DataFetcher from "@/components/data-fetcher";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TagItem } from "@/components/ui/tag";
import Title from "@/components/ui/title";
import { ApiConfig } from "@/configs/api-configs";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
} from "@/constants/validators";
import { apiFetch } from "@/lib/apiFetch";
import { Tag } from "@/types/neon";
import { MediaValidator } from "@/utils/validator";
import { Plus } from "lucide-react";
import Image from "next/image";
import React, { useMemo, useRef, useState } from "react";

const PostUploadPage = () => {
  const [tags, setTags] = useState<{ tag: string; id?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const handleUploadPost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);

      const form = e.currentTarget;
      const formData = new FormData(form);
      formData.append("tags", JSON.stringify(tags));
      if (media) {
        formData.append("file", media);
      }
      const url = "/api/post";

      apiFetch(url, {
        ...ApiConfig.postForm,
        body: formData,
      })
        .then((res) => res?.json())
        .then((data) => {
          console.log(data);
        })
        .finally(() => form.reset());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const pickMedia = () => fileRef.current?.click();

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = MediaValidator(file);
    if (error) {
      alert(error);
      return;
    }

    setMedia(file);
  };

  const handleAddTag = (tag: string, id?: string) => {
    if (!/^\p{L}+$/u.test(tag) || tags.some((t) => t.tag === tag)) return;
    setTags((prev) => [...(prev ?? []), { tag, id }]);
    tagInputRef.current!.value = "";
  };

  const TagsFetchConfigs = useMemo(() => ApiConfig.dataFetcher, []);

  return (
    <div className="p-20 max-lg:px-15 max-md:px-10 max-sm:px-5">
      <div className="flex justify-center w-full">
        <div className="flex flex-col gap-4.5 sm:w-full lg:w-1/2">
          <div className="text-center">
            <Title title="Upload a post..." font="--font-plusJakartaSans" />
          </div>
          <form
            ref={formRef}
            onSubmit={handleUploadPost}
            className="flex flex-col gap-4.5"
          >
            <Input name="title" placeholder="title" />
            <DefaultTextarea
              name="description"
              placeholder="description"
              cols={8}
            />
          </form>
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
                url="/api/tags?dir=ASC&limit=10"
                config={TagsFetchConfigs as RequestInit & { enabled: boolean }}
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
          <div>
            {media && ALLOWED_IMAGE_TYPES.includes(media.type) && (
              <Image
                src={URL.createObjectURL(media)}
                width={1080}
                height={720}
                quality={90}
                alt="uploaded-media"
                className="rounded-lg w-full"
              />
            )}
          </div>
          <div>
            <input
              type="file"
              accept={`${ALLOWED_IMAGE_TYPES.join(",")}, ${ALLOWED_VIDEO_TYPES.join(",")}`}
              ref={fileRef}
              onChange={handleMediaChange}
              hidden
              className="w-0 h-0 scale-0 hidden"
            />
            <button
              type="button"
              className="text-muted-foreground tracking-wide font-plusJakartaSans text-sm w-full p-2.5 flex justify-center border border-active-bg rounded-lg cursor-pointer"
              onClick={pickMedia}
            >
              Upload a picture/video
            </button>
          </div>
          <button
            className={`
              rounded-md bg-foreground dark:text-secondary-bg 
              text-white py-3 cursor-pointer font-plusJakartaSans 
              font-semibold text-lg tracking-tight hover:bg-foreground/60
            `}
            onClick={() => formRef.current?.requestSubmit()}
          >
            submit
          </button>
          {loading && (
            <div className="text-center">
              <Title title="loading..." text="--text-base" />
            </div>
          )}
        </div>
      </div>
      <div className="h-50"></div>
    </div>
  );
};

export default PostUploadPage;
