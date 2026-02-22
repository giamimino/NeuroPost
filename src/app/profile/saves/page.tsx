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
import { CommentType, Post } from "@/types/neon";
import clsx from "clsx";
import { Heart, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";

const ActivitySections = [
  { label: "Likes", icon: <Heart width={15} /> },
  {
    label: "Comments",
    icon: <MessageCircle width={15} className="-scale-x-100" />,
  },
];

const ProfileSavesPage = () => {
  const [section, setSection] = useState<"likes" | "comments">("likes");
  const [likes, setLikes] = useState<Post[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);
  const router = useRouter();
  const fetchCache = useRef<{ likes: boolean; comments: boolean }>({
    likes: false,
    comments: false,
  });

  const handleViewPost = (id: number) => {
    router.push(`/post/${id}`);
  };

  useEffect(() => {
    if (fetchCache.current[section]) return;

    const url = `/api/user/${section}`;
    apiFetch(url)
      .then((res) => res?.json())
      .then((data) => {
        if (data.ok) {
          if (section === "comments") {
            setComments(data.comments);
          } else if (section === "likes") {
            setLikes(data.likes);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => (fetchCache.current[section] = true));
  }, [section]);

  return (
    <div className="pt-20 px-5">
      <Card className="w-full py-3">
        <CardHeader className="gap-0">
          <div className="flex gap-5 justify-center">
            {ActivitySections.map((item) => (
              <div
                key={`${item.label}`}
                className={`
                flex font-plusJakartaSans uppercase tracking-wider text-xs items-center font-medium flex-1 justify-center
              `}
              >
                <button
                  className={clsx(
                    "flex gap-2.5 items-center cursor-pointer hover:opacity-80 border-b pb-1.5",
                    "transition duration-300 ease-initial border-transparent",
                    section === item.label.toLowerCase()
                      ? "border-white"
                      : "opacity-60",
                  )}
                  onClick={() =>
                    setSection(item.label.toLowerCase() as typeof section)
                  }
                >
                  {item.icon}
                  {item.label}
                </button>
              </div>
            ))}
          </div>
          <Line />
        </CardHeader>
        <CardContent className="grid  gap-6 grid-cols-3 justify-center">
          {section === "likes" &&
            likes.map((item) => (
              <Card
                className="gap-0 pb-0  overflow-hidden justify-between"
                key={item.id}
              >
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className=" line-clamp-3">
                    {item.description}
                  </CardDescription>
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
          {section === "comments" &&
            comments.map((item) => (
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
      </Card>
    </div>
  );
};

export default ProfileSavesPage;
