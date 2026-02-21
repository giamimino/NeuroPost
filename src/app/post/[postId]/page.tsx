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
import {
  CommentType,
  CommentUserType,
  MediaType,
  Post,
  UserJoin,
} from "@/types/neon";
import { Send, Settings } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { use, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { Input } from "@/components/ui/input";
import Line from "@/components/ui/Line";
import { useAlertStore } from "@/store/zustand/alertStore";
import { ERRORS } from "@/constants/error-handling";

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
  const [comments, setComments] = useState<
    (CommentType & { user: CommentUserType })[]
  >([]);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const { addAlert } = useAlertStore();

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

  const addComment = async () => {
    if (!post) return;

    const content = commentInputRef.current?.value;
    const res = await apiFetch("/api/post/comment", {
      ...ApiConfig.post,
      body: JSON.stringify({ post_id: post.id, content }),
    });
    const data = await res?.json();
    if (data.ok) {
      setComments((prev) => [data.comment, ...prev]);
    } else {
      addAlert({
        id: crypto.randomUUID(),
        title: data.error.title || ERRORS.GENERIC_ERROR.title,
        description: data.error.description || ERRORS.GENERIC_ERROR.description,
        type: "error",
        duration: 1500,
      });
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

  useEffect(() => {
    if(!post) return
    
    const url = `/api/post/comment?postId=${post.id}&limit=20` 
    fetch(url).then(res => res.json()).then(data => {
      if(data.ok) {
        setComments(data.comments)
      }
    })
  }, [post])

  if (deleted)
    return (
      <div className="pt-25 flex justify-center">
        <CardDescription>This post has been deleted.</CardDescription>
      </div>
    );
  return (
    <div className="pt-25 flex flex-col gap-5">
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
      <div className="w-full flex items-center justify-center">
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Comments</CardTitle>
            <div className="flex gap-2.5 items-center">
              <Input ref={commentInputRef} placeholder="Add a comment..." />
              <Button
                variant={"outline"}
                className="cursor-pointer"
                onClick={addComment}
              >
                <Send />
              </Button>
            </div>
            <Line className="mt-5" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {comments.map((c) => (
              <Card key={`${c.id}-${c.post_id}`} className="rounded-none border-t-0 border-l-0 border-r-0 p-3">
                <CardContent className="flex flex-col gap-3 px-0">
                  <CardTitle>
                    {c.user.name}
                  </CardTitle>
                  <CardDescription>{c.content}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="h-50"></div>
    </div>
  );
};

export default PostPage;
