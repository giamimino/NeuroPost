"use client";
import { useCommentToggleStore } from "@/store/zustand/commentsToggle.store";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { ChevronDown, ChevronUp, Ellipsis, Send, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { CommentType, CommentUserType } from "@/types/neon";
import { apiFetch } from "@/lib/apiFetch";
import ToggleController from "./ToggleController";
import { Input } from "../ui/input";
import { ApiConfig } from "@/configs/api-configs";
import { ERRORS } from "@/constants/error-handling";
import { useAlertStore } from "@/store/zustand/alert.store";
import { Skeleton } from "../ui/skeleton";
import { SkeletonComments } from "../ui/Skeleton-examples";
import { timeAgo } from "@/utils/functions/timeAgo";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Comment,
  CommentContainer,
  CommentPost,
  CommentReaction,
} from "./CommentsContainer";
import { commentsReactions } from "@/app/post/[postId]/ClientPostPage";
import { ContentToggleContainer, ContentToggle } from "../ContentToggle";
import CommentRepliesProvider from "../providers/commentReplies.provider";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenu,
} from "../ui/dropdown-menu";
import {
  HoverCardTrigger,
  HoverCardContent,
  HoverCard,
} from "../ui/hover-card";
import { CommentsType } from "@/types/zustand.store";

const CommentProvider = () => {
  const { comment, onClose } = useCommentToggleStore();
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<CommentsType[]>([]);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const reachedRef = useRef(false);
  const loadingRef = useRef(false);
  const commentsCursorRef = useRef<{
    created_at: string;
    id: string;
  } | null>(null);
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
      setComments((prev) => [
        {
          ...data.comment,
          reactions: {
            LIKE: { count: 0 },
            LAUGH: { count: 0 },
            WOW: { count: 0 },
            ANGRY: { count: 0 },
            HEART: { count: 0 },
          },
        },
        ...prev,
      ]);
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
  const handleFetchComments = useCallback(
    async (postId: number, append: boolean) => {
      if (loadingRef.current || reachedRef.current) return;

      loadingRef.current = true;

      if (!append) setLoading(true);

      try {
        const params = new URLSearchParams({
          postId: postId.toString(),
          limit: String(10),
          ...(commentsCursorRef.current
            ? {
                cursorCreatedAt: commentsCursorRef.current.created_at,
                cursorId: commentsCursorRef.current.id,
              }
            : {}),
        });

        const res = await apiFetch(`/api/post/comment?${params}`);
        const data = await res?.json();

        if (!data.ok && data.error) {
          addAlert({
            id: crypto.randomUUID(),
            type: "error",
            ...data.error,
          });
        } else if (data.ok && data.comments) {
          if (!append) {
            setComments(data.comments);
          } else {
            setComments((prev) => [...prev, ...data.comment]);
          }

          const isLastPage = !data.nextCursor || data.comments.length < 10;

          if (isLastPage) {
            reachedRef.current = true;
          } else if (data.nextCursor?.id && data.nextCursor?.created_at) {
            commentsCursorRef.current = data.nextCursor;
          }
        }
      } catch {
        addAlert({
          id: crypto.randomUUID(),
          type: "error",
          ...ERRORS.GENERIC_ERROR,
        });
      } finally {
        loadingRef.current = false;

        if(!append) setLoading(false)
      }
    },
    [addAlert],
  );

  useEffect(() => {
    if (!comment || !addAlert) return;
    handleFetchComments(Number(comment), false);
  }, [comment, addAlert, handleFetchComments]);

  return (
    <>
      <AnimatePresence>
        {comment && (
          <motion.div
            className="w-1/3 max-sm:w-0"
            layout
            initial={{ flexBasis: 0, opacity: 0 }}
            animate={{ flexBasis: "33%", opacity: 1 }}
            exit={{ flexBasis: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          >
            <Card className="fixed top-20 w-1/3 max-md:w-1/2 max-sm:w-[94%] max-sm:left-[3%] pb-3 h-[80vh] gap-0">
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
              <CardContent className="overflow-auto pt-5" data-lenis-prevent>
                <CommentRepliesProvider>
                  {comments.map((c) => (
                    <CommentContainer key={c.id}>
                      <Comment className="flex flex-col gap-2.5">
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2.5">
                            <Comment.Profile className="w-8 h-8">
                              {typeof c.user.profile_url === "string" ? (
                                <Image
                                  src={c.user.profile_url}
                                  width={40}
                                  height={40}
                                  alt="user-profile"
                                  className="w-8 h-8 object-cover rounded-full"
                                  style={{
                                    width: 32,
                                    height: 32,
                                  }}
                                />
                              ) : (
                                <Skeleton className="h-8 w-8 rounded-full" />
                              )}
                            </Comment.Profile>
                            <div className="flex flex-col gap-1.5">
                              <Comment.Header>
                                <CardTitle
                                  className="text-foreground cursor-pointer"
                                  onClick={() =>
                                    router.push(`/u/${c.user.username}`)
                                  }
                                >
                                  {c.user.name}
                                </CardTitle>
                                <CardDescription className="text-sm">
                                  {timeAgo(new Date(c.created_at))}
                                </CardDescription>
                              </Comment.Header>
                              <Comment.Content>
                                <CardDescription className="text-wrap w-full max-w-100">
                                  {c.content}
                                </CardDescription>
                              </Comment.Content>
                              <div className="flex gap-2.5">
                                <div>
                                  <CommentReaction
                                    initialUserReaction={c.user_reaction}
                                    initialReactions={{
                                      LIKE: {
                                        count: c.reactions.LIKE?.count || 0,
                                      },
                                      ANGRY: {
                                        count: c.reactions.ANGRY?.count || 0,
                                      },
                                      HEART: {
                                        count: c.reactions.HEART?.count || 0,
                                      },
                                      WOW: {
                                        count: c.reactions.WOW?.count || 0,
                                      },
                                      LAUGH: {
                                        count: c.reactions.LAUGH?.count || 0,
                                      },
                                    }}
                                    commentId={c.id}
                                  >
                                    <HoverCard>
                                      <HoverCardTrigger>
                                        <CommentReaction.BaseReaction />
                                      </HoverCardTrigger>
                                      <HoverCardContent
                                        side="top"
                                        sideOffset={10}
                                        className="flex gap-2.5 w-fit py-2"
                                      >
                                        {commentsReactions.map((c) => (
                                          <CommentReaction.ReactionBtn
                                            key={c.id}
                                            reaction={c}
                                          />
                                        ))}
                                      </HoverCardContent>
                                    </HoverCard>
                                  </CommentReaction>
                                </div>
                                <ContentToggleContainer>
                                  <div className="flex gap-2.5 max-lg:flex-col">
                                    <ContentToggle.Controller className="w-fit">
                                      <Button
                                        variant={"ghost"}
                                        size={"md"}
                                        className="cursor-pointer rounded-xl text-xs"
                                      >
                                        Reply
                                      </Button>
                                    </ContentToggle.Controller>
                                    <ContentToggle.Content>
                                      <CommentPost
                                        post_id={c.post_id}
                                        comment_id={c.id}
                                        className="flex gap-2.5 items-center"
                                      >
                                        <CommentPost.Input
                                          className="px-2 py-1 text-xs"
                                          placeholder="Write a reply..."
                                        />
                                        <CommentPost.Button>
                                          <Button
                                            variant={"outline"}
                                            className="cursor-pointer w-fit"
                                          >
                                            <Send />
                                          </Button>
                                        </CommentPost.Button>
                                      </CommentPost>
                                    </ContentToggle.Content>
                                  </div>
                                </ContentToggleContainer>
                              </div>
                            </div>
                          </div>
                          {c.role === "creator" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant={"ghost"}
                                  size={"sm"}
                                  className="cursor-pointer"
                                >
                                  <Ellipsis />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant={"none"}
                                      className="w-full cursor-pointer border border-destructive text-destructive bg-destructive/4 hover:bg-destructive/10"
                                    >
                                      Delete
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <div className="flex gap-3 flex-col p-3 w-75">
                                      <CardDescription>
                                        Are you sure you want to delete this
                                        comment?
                                      </CardDescription>
                                      <div className="flex gap-3">
                                        <DropdownMenuItem className="focus:bg-transparent focus:text-inherit p-0">
                                          <Button
                                            onClick={() =>
                                              handleDeleteComment({
                                                commentId: c.id,
                                              })
                                            }
                                            variant={"none"}
                                            className="w-full cursor-pointer border border-destructive text-destructive bg-destructive/4 hover:bg-destructive/10"
                                          >
                                            Delete
                                          </Button>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="focus:bg-transparent focus:text-inherit p-0">
                                          <Button
                                            variant={"ghost"}
                                            className="cursor-pointer"
                                          >
                                            cancel
                                          </Button>
                                        </DropdownMenuItem>
                                      </div>
                                    </div>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        {/* replies */}
                        <Comment.Replies
                          className="ml-10 flex flex-col gap-2"
                          comment_id={c.id}
                        />
                        {c.replies_count > 0 && (
                          <Comment.ReplyToggle className="w-fit">
                            {({ status }) => (
                              <Button
                                variant={"outline"}
                                className="cursor-pointer rounded-lg"
                              >
                                {status ? (
                                  <>
                                    <p>Hide Replies</p>
                                    <ChevronUp className="size-4" />
                                  </>
                                ) : (
                                  <>
                                    <p>{c.replies_count} Replies</p>
                                    <ChevronDown className="size-4" />
                                  </>
                                )}
                              </Button>
                            )}
                          </Comment.ReplyToggle>
                        )}
                      </Comment>
                    </CommentContainer>
                  ))}
                </CommentRepliesProvider>
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
