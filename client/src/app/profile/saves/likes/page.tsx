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
import { Post } from "@/types/neon";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const ProfileLikesPage = () => {
  const [likes, setLikes] = useState<Post[]>([]);
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
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="">
      <CardContent className="grid gap-6 grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 justify-center">
        {likes.map((item) => (
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
      </CardContent>
    </div>
  );
};

export default ProfileLikesPage;
