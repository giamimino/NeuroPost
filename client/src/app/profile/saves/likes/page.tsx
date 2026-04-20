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
import { ERRORS } from "@/constants/error-handling";
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
        } else if (data.error) {
          addAlert({
            id: crypto.randomUUID(),
            type: "error",
            ...data.error,
          });
        }
      })
      .catch(() => addAlert({ id: crypto.randomUUID(), type: "error", ...ERRORS.GENERIC_ERROR }));
  }, []);

  return (
    <div className="">
      <CardContent className="grid gap-6 grid-cols-4 max-2xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 justify-center">
        {likes
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
                    className="object-cover h-40"
                  />
                </div>
              )}
              <CardContent className="flex flex-col gap-3">
                <CardTitle>{item.title}</CardTitle>
                {!item.media.mediaUrl &&  (
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
