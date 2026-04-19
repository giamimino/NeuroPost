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
import Line from "@/components/ui/Line";
import { monthsShort } from "@/constants/months";
import { apiFetch } from "@/lib/apiFetch";
import { useAlertStore } from "@/store/zustand/alertStore";
import { CommentType, Post } from "@/types/neon";
import clsx from "clsx";
import { Heart, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const ActivitySections = [
  { label: "Likes", icon: <Heart width={15} /> },
  {
    label: "Comments",
    icon: <MessageCircle width={15} className="-scale-x-100" />,
  },
];

const ProfileSavesPage = () => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const router = useRouter();
  const { addAlert } = useAlertStore();

  const handleViewPost = (id: number) => {
    router.push(`/post/${id}`);
  };

  useEffect(() => {
    const url = `/api/user/comments`;
    apiFetch(url)
      .then((res) => res?.json())
      .then((data) => {
        if (data.ok) {
          setComments(data.comments);
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
      <CardContent className="grid gap-6 grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 justify-center">
        {comments.map((item) => (
          <Card key={item.id} className="relative p-4">
            <Button
              className="absolute top-3 right-3 cursor-pointer"
              variant={"link"}
              onClick={() => router.push(`/post/${item.post_id}`)}
            >
              view post
            </Button>
            <CardHeader className="px-0">
              <CardDescription className="flex flex-col">
                <span>
                  {`${new Date(item.created_at).getHours()}:${new Date(item.created_at).getMinutes().toFixed().padStart(2, "0")}`}
                </span>
                <span>
                  {`${new Date(item.created_at).getDate()} 
                      ${monthsShort[new Date(item.created_at).getMonth()]}
                      ${new Date(item.created_at).getFullYear()}
                      `}
                </span>
              </CardDescription>
              <CardTitle>{item.content}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </CardContent>
    </div>
  );
};

export default ProfileSavesPage;
