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
import { apiFetch } from "@/lib/apiFetch";
import { useAlertStore } from "@/store/zustand/alertStore";
import { PostMedia } from "@/types/neon";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const ProfileLikesPage = () => {
  const [likes, setLikes] = useState<PostMedia[]>([]);
  const router = useRouter();
  const { addAlert } = useAlertStore();

  const handleViewPost = (id: number) => {
    router.push(`/post/${id}`);
  };

  useEffect(() => {
    const url = `/api/user/likes`;
    apiFetch(url)
      .then((res) => res?.json())
      .then((data) => {
        if (data.ok) {
          setLikes(data.likes);
          console.log(data);
        } else if (data.error) {
          addAlert({
            id: crypto.randomUUID(),
            type: "error",
            ...data.error,
          });
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="">
      <CardContent className="grid gap-6 grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 justify-center">
        {likes
          .sort((a, b) => {
            return (
              (b.media?.mediaUrl && b.media.type === "image" ? 1 : 0) -
              (a.media?.mediaUrl && a.media.type === "image" ? 1 : 0)
            );
          })
          .map((item) => (
            <Card
              className={clsx(
                "gap-0 pb-0 overflow-hidden justify-between",
                item.media.mediaUrl && item.media.type === "image" && "pt-0",
              )}
              key={item.id}
            >
              {item.media.mediaUrl && item.media.type === "image" && (
                <div className="pb-3">
                  <Image
                    src={item.media.mediaUrl}
                    alt={item.title}
                    width={720}
                    height={360}
                    className="object-cover max-h-90"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="justify-self-start">
                {!item.media.mediaUrl || item.media.type !== "image" && (
                  <CardDescription className="line-clamp-4">
                    {item.description}
                  </CardDescription>
                )}
              </CardContent>
              <CardFooter>
                <div className="py-2 w-full">
                  <Button
                    variant={"outline"}
                    className="w-full cursor-pointer"
                    onClick={() => handleViewPost(item.id)}
                  >
                    View
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
      </CardContent>
    </div>
  );
};

export default ProfileLikesPage;
