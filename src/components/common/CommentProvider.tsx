"use client";
import { useCommentsStore } from "@/store/zustand/commentsStore";
import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Ellipsis, Send, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { CommentType, CommentUserType } from "@/types/neon";
import { apiFetch } from "@/lib/apiFetch";
import ToggleController from "./ToggleController";
import { Input } from "../ui/input";
import { ApiConfig } from "@/configs/api-configs";
import { ERRORS } from "@/constants/error-handling";
import { useAlertStore } from "@/store/zustand/alertStore";
import { Skeleton } from "../ui/skeleton";
import { SkeletonComments } from "../ui/Skeleton-examples";
import { timeAgo } from "@/utils/functions/timeAgo";
import Image from "next/image";
import { useRouter } from "next/navigation";

const CommentProvider = () => {
  const { comment, onClose } = useCommentsStore();
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<
    (CommentType & { user: CommentUserType; role: "creator" | "guest" })[]
  >([]);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const { addAlert } = useAlertStore();
  const router = useRouter();

  const addComment = async () => {
    if (!comment) return;

    const content = commentInputRef.current?.value;
    const res = await apiFetch("/api/post/comment", {
      ...ApiConfig.post,
      body: JSON.stringify({ post_id: comment, content }),
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
    commentInputRef.current!.value = "";
  };

  const handleDeleteComment = async ({ commentId }: { commentId: string }) => {
    try {
      const url = `/api/post/comment/${commentId}`;
      const res = await apiFetch(url, { method: ApiConfig.delete.method });
      const data = await res?.json();

      if (data.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else if (data.error) {
        addAlert({
          id: crypto.randomUUID(),
          type: "error",
          ...data.error,
          duration: 3 * 1000,
        });
      }
    } catch (error) {
      console.error(error);
      
    }
  };
  useEffect(() => {
    if (!comment || !addAlert) return;
    const fethData = async () => {
      setLoading(true);
      const url = `/api/post/comment?postId=${Number(comment)}&limit=20&withProfile=true`;
      apiFetch(url)
        .then((res) => res?.json())
        .then((data) => {
          if (data.ok) {
            setComments(data.comments);
          }
        })
        .finally(() => setLoading(false))
        .catch((error) => {
          console.error(error);
          addAlert({
            id: crypto.randomUUID(),
            type: "error",
            ...ERRORS.GENERIC_ERROR,
            duration: 2 * 2000,
          });
        });
    }

    fethData()
  }, [comment, addAlert]);

  return (
    <>
      <AnimatePresence>
        {comment && (
          <motion.div
            className="w-1/3"
            layout
            initial={{ flexBasis: 0, opacity: 0 }}
            animate={{ flexBasis: "33%", opacity: 1 }}
            exit={{ flexBasis: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          >
            <Card className="fixed top-20 w-1/3 pb-3 h-[80vh] gap-0">
              <div className="flex justify-between items-center px-6">
                <CardTitle>Comments</CardTitle>
                <Button
                  variant={"outline"}
                  size={"md"}
                  className="cursor-pointer"
                  onClick={onClose}
                >
                  <XIcon />
                </Button>
              </div>
              <CardContent className="overflow-auto">
                {loading ? (
                  <SkeletonComments />
                ) : (
                  comments.map((c) => (
                    <Card
                      key={`${c.id}-${c.post_id}`}
                      className="rounded-none border-t-0 border-l-0 border-r-0 p-3 relative"
                    >
                      {c.role === "creator" && (
                        <ToggleController
                          animatePresence
                          whatToShow={() => (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.5 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute right-15 top-1/2 -translate-y-1/2"
                            >
                              <Card className="p-3">
                                <CardContent className="p-0">
                                  <ToggleController
                                    animatePresence
                                    whatToShow={({ handleShow }) => (
                                      <motion.div
                                        initial={{
                                          opacity: 0,
                                          y: 50,
                                          scale: 0.75,
                                        }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute -top-4 -translate-y-1/2 right-0 z-10 w-5/2"
                                      >
                                        <Card className="">
                                          <CardHeader>
                                            <CardDescription>
                                              Are you sure you want to delete
                                              this comment?
                                            </CardDescription>
                                          </CardHeader>
                                          <CardContent className="flex gap-2.5">
                                            <Button
                                              variant={"outline"}
                                              className="cursor-pointer"
                                              onClick={() =>
                                                handleDeleteComment({
                                                  commentId: c.id,
                                                })
                                              }
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
                                        onClick={() => setShow(true)}
                                        className="hover:text-red-600 cursor-pointer"
                                        variant={"outline"}
                                      >
                                        Delete
                                      </Button>
                                    )}
                                  </ToggleController>
                                </CardContent>
                              </Card>
                            </motion.div>
                          )}
                        >
                          {({ setShow }) => (
                            <Button
                              onClick={() => setShow((prev) => !prev)}
                              className="w-fit cursor-pointer absolute top-1/2 -translate-y-1/2 right-5"
                              variant={"ghost"}
                              size={"sm"}
                            >
                              <Ellipsis />
                            </Button>
                          )}
                        </ToggleController>
                      )}
                      <CardContent className="flex flex-col gap-3 px-0">
                        <div className="flex gap-2.5">
                          {c.user.profile_url ? (
                            <Image
                              src={c.user.profile_url}
                              width={64}
                              height={64}
                              className="w-8 h-8 object-cover rounded-full self-start"
                              alt={c.user.name}
                            />
                          ) : (
                            <Skeleton className="w-8 h-8 rounded-full" />
                          )}
                          <div>
                            <div className="flex gap-2">
                              <CardTitle
                                className="cursor-pointer"
                                onClick={() =>
                                  router.push(`/u/${c.user.username}`)
                                }
                              >
                                {c.user.name}
                              </CardTitle>
                              <CardDescription>
                                {timeAgo(new Date(c.created_at))}
                              </CardDescription>
                            </div>
                            <CardDescription>{c.content}</CardDescription>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
              <CardFooter className="pt-3 border-t mt-auto">
                <div className="flex gap-2 items-center">
                  <Input
                    ref={commentInputRef}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && commentInputRef.current?.value) {
                        addComment();
                      }
                    }}
                    className="h-8"
                    placeholder="Add a comment..."
                  />
                  <Button
                    variant={"outline"}
                    size={"md"}
                    className="cursor-pointer"
                    onClick={addComment}
                  >
                    <Send />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CommentProvider;
