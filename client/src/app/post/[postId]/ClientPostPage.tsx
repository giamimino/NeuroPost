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
import {
  SkeletonCard,
  SkeletonReplyComment,
} from "@/components/ui/Skeleton-examples";
import { ApiConfig } from "@/configs/api-configs";
import {
  CommentType,
  CommentUserType,
  MediaType,
  Post,
  UserJoin,
} from "@/types/neon";
import {
  ChevronDown,
  ChevronUp,
  ClipboardIcon,
  Ellipsis,
  EllipsisVertical,
  ExternalLink,
  Heart,
  MessageCircle,
  Send,
  Settings,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { use, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { Input } from "@/components/ui/input";
import Line from "@/components/ui/Line";
import { useAlertStore } from "@/store/zustand/alertStore";
import { ERRORS } from "@/constants/error-handling";
import { handleLike } from "@/utils/functions/LikeActions";
import { HandleLikeArgs } from "@/types/arguments";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DefaultTextarea from "@/components/common/DefaultTextarea";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
} from "@/constants/validators";
import { MediaValidator } from "@/utils/validator";
import ActionButton from "@/components/action-button";
import Video from "@/components/common/video";
import { timeAgo } from "@/utils/functions/timeAgo";
import {
  Comment,
  CommentPost,
  CommentContainer,
} from "@/components/common/CommentsContainer";
import {
  ContentToggle,
  ContentToggleContainer,
} from "@/components/ContentToggle";
import { CommentSchemaType } from "@/schemas/comment/comment.schema";

const ClientPostPage = ({
  params,
}: {
  params: Promise<{ postId: number }>;
}) => {
  const { postId } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<
    | (Post & {
        media?: MediaType;
        signedUrl?: string | undefined;
        role: "creator" | "guest";
        user: UserJoin;
        likeid: string | null;
        likes: number;
      })
    | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<CommentSchemaType[]>([]);
  const [deleted, setDeleted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [media, setMedia] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editableValuesRef = useRef<HTMLFormElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const shareUrlRef = useRef<HTMLDivElement>(null);
  const commentsCursorRef = useRef<{
    created_at: string;
    id: string;
  } | null>(null);
  const { addAlert } = useAlertStore();
  const loadingRef = useRef(false);
  const reachedRef = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const handleEditPost = async () => {
    if (!editing || !editableValuesRef.current || !post) return;

    const formData = new FormData(editableValuesRef.current);
    if (media) {
      const error = MediaValidator(media);
      if (error)
        return addAlert({ id: crypto.randomUUID(), type: "error", ...error });
      formData.append("media", media);
    }

    const url = `/api/post/p/${post.id}`;
    const res = await apiFetch(url, { ...ApiConfig.purForm, body: formData });
    const data = await res?.json();

    if (data.ok && data.post) {
      setPost((prev) =>
        prev
          ? {
              ...prev,
              title: data.post.title || prev.title,
              description: data.post.description || prev.description,
              media: data.post.media || prev.media,
              signedUrl: data.signedUrl || prev.signedUrl,
            }
          : prev,
      );
      setEditing(false);
      setMedia(null);
    } else if (data.error) {
      addAlert({ id: crypto.randomUUID(), type: "error", ...data.error });
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = MediaValidator(file);
    if (error) {
      addAlert({ id: crypto.randomUUID(), type: "error", ...error });
      return;
    }

    setMedia(file);
  };

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
    } catch (error) {
      console.error(error);
    }
  };

  const selectText = () => {
    const element = shareUrlRef.current;
    if (!element) return;

    const range = document.createRange();
    range.selectNodeContents(element);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const handleFetchComments = useCallback(async (postId: number) => {
    try {
      if (loadingRef.current || reachedRef.current) return;
      loadingRef.current = true;

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
        setComments((prev) => [...prev, ...data.comments]);
        console.log(data);
        const isLastPage = !data.nextCursor || data.comments.length < 10;

        if (isLastPage) {
          reachedRef.current = true;
        } else if (data.nextCursor?.id && data.nextCursor?.created_at) {
          commentsCursorRef.current = data.nextCursor;
        }
      }
    } catch (err) {
      addAlert({
        id: crypto.randomUUID(),
        type: "error",
        ...ERRORS.GENERIC_ERROR,
      });
    } finally {
      loadingRef.current = false;
    }
  }, []);

  console.log(comments.length);

  // get post
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
  }, [postId]);

  useEffect(() => {
    if (!post) return;

    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (reachedRef.current || loadingRef.current) return;

          handleFetchComments(post.id);
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [post?.id, handleFetchComments]);

  if (deleted)
    return (
      <div className="pt-25 flex justify-center">
        <CardDescription>This post has been deleted.</CardDescription>
      </div>
    );
  return (
    <div className="pt-25 flex flex-col gap-5">
      <div className="w-full flex max-sm:flex-col-reverse justify-center gap-1.5 px-5">
        <div className="w-1/2 max-sm:w-full flex flex-col gap-5">
          <div className="flex items-center justify-center w-full">
            {loading ? (
              <div className="w-full">
                <SkeletonCard />
              </div>
            ) : (
              <Card className={`w-full gap-0 relative pb-0`}>
                <div className="px-6 flex flex-col">
                  {!editing ? (
                    <>
                      <CardTitle className="text-2xl">{post?.title}</CardTitle>
                      <CardDescription>{post?.description}</CardDescription>
                    </>
                  ) : (
                    <form
                      ref={editableValuesRef}
                      className="flex flex-col gap-2.5"
                    >
                      <Input
                        name="title"
                        className="text-2xl font-medium"
                        defaultValue={post?.title}
                      />
                      <DefaultTextarea
                        name="description"
                        defaultValue={post?.description ?? ""}
                      />
                    </form>
                  )}
                </div>
                <CardContent className="pb-5">
                  {/* author stuffs */}
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
                {post?.signedUrl && post.media?.type === "image" && !media ? (
                  <CardFooter className="px-0 mt-5">
                    <Image
                      width={1080}
                      height={720}
                      alt="post-media"
                      src={post.signedUrl}
                      className="w-full object-cover max-h-150 rounded-xl"
                    />
                  </CardFooter>
                ) : (
                  post?.signedUrl &&
                  post.media?.type === "video" &&
                  !media && (
                    <CardFooter className="px-0 mt-5">
                      <Video
                        src={post.signedUrl}
                        controls={false}
                        loop
                        playsInline
                        className="rounded-xl w-full"
                      />
                    </CardFooter>
                  )
                )}
                {media && editing && (
                  <CardFooter className="px-0 mt-5">
                    <Image
                      width={1080}
                      height={720}
                      alt="post-media"
                      src={URL.createObjectURL(media)}
                      className="w-full object-cover max-h-150 rounded-xl"
                    />
                  </CardFooter>
                )}
                {editing && (
                  <div className="flex justify-between items-center">
                    <div className="flex-1"></div>
                    <div className="flex-1 text-center">
                      <Button
                        className="cursor-pointer"
                        variant={"ghost"}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        upload
                      </Button>
                      <input
                        type="file"
                        hidden
                        className="hidden"
                        onChange={handleMediaChange}
                        ref={fileInputRef}
                        accept={`${ALLOWED_IMAGE_TYPES.join(",")}, ${ALLOWED_VIDEO_TYPES.join(",")}`}
                      />
                    </div>
                    <div className="flex flex-1 gap-3 p-3 justify-end font-plusJakartaSans">
                      <Button
                        variant={"secondary"}
                        onClick={() => {
                          setMedia(null);
                          setEditing(false);
                          if (editableValuesRef.current)
                            editableValuesRef.current.reset();
                        }}
                        className="cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant={"destructive"}
                        className={`cursor-pointer`}
                        onClick={handleEditPost}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
          {/* comments */}
          {comments.length > 0 && (
            <div className="w-full flex items-center justify-center">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Comments</CardTitle>
                  <div className="flex gap-2.5 items-center">
                    <Input
                      ref={commentInputRef}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          commentInputRef.current?.value
                        ) {
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
                <CardContent className="flex flex-col gap-3.5">
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
                              <Comment.Header className="flex items-center gap-1.5">
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
                              <ContentToggleContainer>
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
                                    <CommentPost.Button onSuccess={() => {}}>
                                      <Button
                                        variant={"outline"}
                                        className="cursor-pointer w-fit"
                                      >
                                        <Send />
                                      </Button>
                                    </CommentPost.Button>
                                  </CommentPost>
                                </ContentToggle.Content>
                              </ContentToggleContainer>
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
                </CardContent>
              </Card>
            </div>
          )}
          <div ref={loadMoreRef} />
        </div>

        {/* settings, likes, comments and etc  */}
        <div>
          <Card className="p-3 w-full relative gap-0">
            <div className="flex sm:flex-col gap-2">
              <Button
                size={"xs"}
                className="rounded-sm cursor-pointer text-xs"
                variant={"ghost"}
              >
                {post?.likes}
              </Button>
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
                          setPost((p) =>
                            p
                              ? {
                                  ...p,
                                  likeid: null,
                                  likes: post.likes - 1,
                                }
                              : p,
                          );
                        } else if (args.action === "post" && data.ok) {
                          setPost((p) =>
                            p
                              ? {
                                  ...p,
                                  likeid: data.like,
                                  likes: post.likes + 1,
                                }
                              : p,
                          );
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
              <Button
                size={"icon-xs"}
                className={`rounded-sm cursor-pointer`}
                variant={"outline"}
                onClick={async () => {
                  if (comments.length === 0 && post) {
                    await handleFetchComments(post.id);
                  }
                }}
              >
                <MessageCircle
                  {...(comments.length > 0 ? { fill: "#fff" } : {})}
                />
              </Button>
              <ToggleController
                whatToShow={({ handleShow }) => (
                  <Card className="fixed top-1/2 left-1/2 px-4 -translate-1/2 min-w-40 py-4">
                    <div className="grid grid-cols-3 items-center">
                      <Button
                        className="w-fit rounded-sm max-w-6 cursor-pointer"
                        size={"xs"}
                        variant={"outline"}
                        onClick={() => handleShow(false)}
                      >
                        <XIcon />
                      </Button>
                      <CardTitle className=" text-center">Share</CardTitle>
                      <div></div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <div
                        ref={shareUrlRef}
                        className={` 
                        dark:bg-input/30 border-input w-full min-w-0 
                        rounded-md border bg-transparent px-3 py-1.5 text-base shadow-xs transition-[color,box-shadow] 
                        outline-none md:text-sm`}
                      >
                        {document.URL}
                      </div>
                      <ActionButton
                        variant="outline"
                        className="cursor-pointer"
                        size="md"
                        onAction={async () => {
                          try {
                            selectText();
                            await navigator.clipboard.writeText(document.URL);
                            return { data: { ok: true } };
                          } catch {
                            return { error: ERRORS.GENERIC_ERROR };
                          }
                        }}
                      >
                        <ClipboardIcon />
                      </ActionButton>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size={"icon-xs"}
                      className={`rounded-sm cursor-pointer`}
                      variant={"outline"}
                    >
                      <Settings />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <div className="p-1 flex flex-col gap-2">
                      <DropdownMenuItem className="p-0">
                        <Button
                          size={"md"}
                          variant={"outline"}
                          className="cursor-pointer w-full"
                          onClick={() => setEditing(true)}
                        >
                          Edit
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size={"md"}
                            variant={"outline"}
                            className="cursor-pointer w-full hover:text-red-600"
                          >
                            Delete
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <div className="flex flex-col gap-2.5 p-2.5">
                            <CardDescription>
                              Are you sure you want to delete this post?
                            </CardDescription>
                            <div className="flex gap-2.5">
                              <DropdownMenuItem className="p-0">
                                <Button
                                  variant={"outline"}
                                  className="cursor-pointer"
                                  onClick={handleDelete}
                                >
                                  Yes
                                </Button>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="p-0">
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
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </Card>
        </div>
      </div>
      <div className="h-50"></div>
    </div>
  );
};

export default ClientPostPage;
