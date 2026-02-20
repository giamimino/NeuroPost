"use client";
import ToggleController from "@/components/common/ToggleController";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SkeletonCard } from "@/components/ui/Skeleton-examples";
import { Spinner } from "@/components/ui/spinner";
import Title from "@/components/ui/title";
import { ApiConfig } from "@/configs/api-configs";
import { auth } from "@/lib/auth";
import { MediaType, Post, UserJoin } from "@/types/neon";
import { Settings } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { use, useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";

const PostPage = ({ params }: { params: Promise<{ postId: number }> }) => {
  const { postId } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<
    | (Post & {
        media?: MediaType;
        signedUrl?: string | undefined;
        role: "creator" | "guest";
      } & UserJoin)
    | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [deleted, setDeleted] = useState(false);

  const handleDelete = async () => {
    if (!post) return;
    try {
      const res = await apiFetch("/api/post", {
        ...ApiConfig.delete,
        body: JSON.stringify({
          postId: post.id,
          mediaId: post.media?.id || undefined,
        }),
      });
      const data = await res?.json();
      console.log(data);
      
  
      if (data.ok) {
        setDeleted(true);
      }
    } catch (error) {
      console.error(error);
    }
    

  
  };

  useEffect(() => {
    if (!postId) return;

    const url = `/api/post/p/${postId}`;
    apiFetch(url, ApiConfig.get)
      .then((res) => res?.json())
      .then((data) => {
        if (data.ok) {
          setPost(data.post);
        }
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  if (deleted)
    return (
      <div className="pt-25 flex justify-center">
        <CardDescription>This post has been deleted.</CardDescription>
      </div>
    );
  return (
    <div className="pt-25">
      <div className="flex items-center justify-center w-full">
        {loading ? (
          <div className="w-1/2">
            <SkeletonCard />
          </div>
        ) : (
          <Card
            className={`w-1/2 gap-0 relative ${post?.signedUrl ? "pb-0 overflow-hidden" : ""}`}
          >
            {post?.role === "creator" && (
              <ToggleController
                animatePresence
                whatToShow={() => (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.5 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <Card className="py-3">
                      <CardContent className="px-3">
                        <ToggleController
                          animatePresence
                          whatToShow={({ handleShow }) => (
                            <motion.div
                              initial={{ opacity: 0, y: 50, scale: 0.75 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute right-0"
                            >
                              <Card className="w-fit">
                                <CardHeader>
                                  <CardDescription>
                                    Are you sure you want to delete this post?
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="flex gap-2.5">
                                  <Button
                                    variant={"outline"}
                                    className="cursor-pointer"
                                    onClick={handleDelete}
                                  >
                                    Yes
                                  </Button>
                                  <Button
                                    variant={"ghost"}
                                    className="cursor-pointer"
                                    onClick={
                                      handleShow
                                        ? () => handleShow(false)
                                        : undefined
                                    }
                                  >
                                    cancel
                                  </Button>
                                </CardContent>
                              </Card>
                            </motion.div>
                          )}
                        >
                          {({ setShow }) => (
                            <Button
                              size={"md"}
                              variant={"outline"}
                              className="cursor-pointer hover:text-red-600"
                              onClick={() => setShow(true)}
                            >
                              Delete
                            </Button>
                          )}
                        </ToggleController>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
                className="absolute top-5 right-5 gap-2"
              >
                {({ setShow }) => (
                  <Button
                    size={"sm"}
                    className="w-fit cursor-pointer self-end"
                    onClick={() => setShow((prev) => !prev)}
                  >
                    <Settings />
                  </Button>
                )}
              </ToggleController>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">
                {post?.title ?? "[title]"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{post?.description}</CardDescription>
              <div>
                <button
                  className="text-foreground cursor-pointer hover:underline"
                  onClick={() => router.push(`/u/${post?.username}`)}
                >
                  @{post?.name}
                </button>
              </div>
            </CardContent>
            {post?.signedUrl && post.media?.type === "image" && (
              <CardFooter className="px-0 mt-10">
                <img
                  src={post.signedUrl}
                  className="w-full object-cover max-h-150 rounded-xl"
                />
              </CardFooter>
            )}
          </Card>
        )}
      </div>
      <div className="h-50"></div>
    </div>
  );
};

export default PostPage;
