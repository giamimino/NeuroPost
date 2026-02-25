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
import {
  Ellipsis,
  ExternalLink,
  Heart,
  MessageCircleMore,
  Send,
  Settings,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { use, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { Input } from "@/components/ui/input";
import Line from "@/components/ui/Line";
import { useAlertStore } from "@/store/zustand/alertStore";
import { ERRORS } from "@/constants/error-handling";
import { handleLike } from "@/utils/functions/LikeActions";
import { HandleLikeArgs } from "@/types/arguments";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

const PostPage = ({ params }: { params: Promise<{ postId: number }> }) => {
  const { postId } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<
    | (Post & {
        media?: MediaType;
        signedUrl?: string | undefined;
        role: "creator" | "guest";
        user: UserJoin;
        likeid: string | null;
      })
    | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [deleted, setDeleted] = useState(false);
  const [comments, setComments] = useState<
    (CommentType & { user: CommentUserType; role: "creator" | "guest" })[]
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
    } catch (error) {}
  };

  useEffect(() => {
    if (!postId) return;

    const url = `/api/post/p/${postId}`;
    apiFetch(url, ApiConfig.get)
      .then((res) => res?.json())
      .then((data) => {
        if (data.ok) {
          console.log(data);

          setPost(data.post);
        }
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!post) return;

    const url = `/api/post/comment?postId=${post.id}&limit=20`;
    apiFetch(url)
      .then((res) => res?.json())
      .then((data) => {
        if (data.ok) {
          setComments(data.comments);
        }
      });
  }, [post]);

  if (deleted)
    return (
      <div className="pt-25 flex justify-center">
        <CardDescription>This post has been deleted.</CardDescription>
      </div>
    );
  return (
    <div className="pt-25 flex flex-col gap-5">
      <div className="w-full flex justify-center gap-1.5">
        <div className="w-1/2 flex flex-col gap-5">
          <div className="flex items-center justify-center w-full">
            {loading ? (
              <div className="w-full">
                <SkeletonCard />
              </div>
            ) : (
              <Card className={`w-full gap-0 relative pb-0`}>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {post?.title ?? "[title]"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-5">
                  <CardDescription>{post?.description}</CardDescription>
                  <div className="flex items-center mt-2 gap-2.5">
                    {typeof post?.user.profile_url === "string" ? (
                      <Image
                        src={post.user.profile_url}
                        width={40}
                        height={40}
                        alt="user-profile"
                        className="w-8 h-8 object-cover rounded-full"
                      />
                    ) : (
                      <Skeleton className="h-8 w-8 rounded-full" />
                    )}
                    <button
                      className="text-foreground cursor-pointer hover:underline"
                      onClick={() => router.push(`/u/${post?.user.username}`)}
                    >
                      @{post?.user.name}
                    </button>
                  </div>
                </CardContent>
                {post?.signedUrl && post.media?.type === "image" && (
                  <CardFooter className="px-0 mt-5">
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
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Comments</CardTitle>
                <div className="flex gap-2.5 items-center">
                  <Input
                    ref={commentInputRef}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && commentInputRef.current?.value) {
                        addComment();
                      }
                    }}
                    placeholder="Add a comment..."
                  />
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
                                      className="absolute top-1/2 -translate-y-1/2 -right-3/1 z-10 w-5/2"
                                    >
                                      <Card className="">
                                        <CardHeader>
                                          <CardDescription>
                                            Are you sure you want to delete this
                                            comment?
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
                      <CardTitle>{c.user.name}</CardTitle>
                      <CardDescription>{c.content}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
        <div>
          <Card className="p-3 w-full relative flex flex-col gap-2">
            <Button
              size={"icon-xs"}
              className={`rounded-sm cursor-pointer ${post?.likeid && "text-red-600"}`}
              variant={"outline"}
              onClick={
                post
                  ? async () => {
                      const args: HandleLikeArgs = post.likeid
                        ? { action: "delete", id: post.likeid }
                        : {
                            action: "post",
                            postId: post.id,
                          };
                      const data = await handleLike(args);
                      if (args.action === "delete" && data.ok) {
                        setPost((p) => (p ? { ...p, likeid: null } : p));
                      } else if (args.action === "post" && data.ok) {
                        setPost((p) => (p ? { ...p, likeid: data.like } : p));
                      } else if (data.error) {
                        addAlert({
                          ...data.error,
                          id: crypto.randomUUID(),
                          duration: 3 * 1000,
                          type: "error",
                        });
                      }
                    }
                  : undefined
              }
            >
              <Heart {...(post?.likeid ? { fill: "#ff0000" } : {})} />
            </Button>
            <ToggleController
              whatToShow={({ handleShow }) => (
                <Card className="fixed top-1/2 left-1/2 -translate-1/2 min-w-40 py-4">
                  <div className="px-4 flex items-center">
                    <Button
                      className="w-fit rounded-sm flex-1 max-w-6 cursor-pointer"
                      size={"xs"}
                      variant={"outline"}
                      onClick={() => handleShow(false)}
                    >
                      <XIcon />
                    </Button>
                    <CardTitle className="flex-1 text-center">Share</CardTitle>
                  </div>
                  <CardContent></CardContent>
                </Card>
              )}
            >
              {({ setShow }) => (
                <Button
                  size={"icon-xs"}
                  variant={"outline"}
                  className="cursor-pointer rounded-sm"
                  onClick={() => setShow((prev) => !prev)}
                >
                  <ExternalLink />
                </Button>
              )}
            </ToggleController>
            {post?.role === "creator" && (
              <ToggleController
                animatePresence
                whatToShow={() => (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.5 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute -bottom-[135%] right-0"
                  >
                    <Card className="py-3">
                      <CardContent className="px-3 flex flex-col gap-2.5">
                        <Button
                          size={"md"}
                          variant={"outline"}
                          className="cursor-pointer w-full"
                        >
                          Edit
                        </Button>
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
                              className="cursor-pointer w-full hover:text-red-600"
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
              >
                {({ setShow }) => (
                  <Button
                    size={"xs"}
                    className="w-fit cursor-pointer self-end rounded-sm"
                    variant={"outline"}
                    onClick={() => setShow((prev) => !prev)}
                  >
                    <Settings />
                  </Button>
                )}
              </ToggleController>
            )}
          </Card>
        </div>
      </div>
      <div className="h-50"></div>
    </div>
  );
};

export default PostPage;
