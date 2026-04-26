import React, {
  DetailedHTMLProps,
  InputHTMLAttributes,
  useRef,
  useState,
} from "react";
import { Card, CardDescription, CardTitle } from "../ui/card";
import {
  CommentContext,
  CommentPostContext,
  CommentReactionContext,
  useComment,
  useCommentPost,
  useCommentReaction,
} from "@/store/contexts/CommentCntext";
import { Input } from "../ui/input";
import {
  CommentPostContextType,
  CommentReactionContextType,
  CommentReactionsCountType,
  UserReactionType,
} from "@/types/context";
import { Spinner } from "../ui/spinner";
import { apiFetch } from "@/lib/apiFetch";
import {
  CommentReplyAPIResSchema,
  CommentReplyAPISchema,
  CommentReplyType,
} from "@/schemas/comment/reply.schema";
import { useAlertStore } from "@/store/zustand/alertStore";
import { ERRORS } from "@/constants/error-handling";
import useReplies from "@/hook/useReplies";
import { SkeletonReplyComment } from "../ui/Skeleton-examples";
import { ChevronDown, ChevronUp, Ellipsis, Send } from "lucide-react";
import { Button } from "../ui/button";
import { ContentToggle, ContentToggleContainer } from "../ContentToggle";
import { timeAgo } from "@/utils/functions/timeAgo";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";
import { useRouter } from "next/navigation";
import { RepliesCache } from "@/lib/cache/replies.cache";
import { useContentToggle } from "@/store/contexts/ContentToggle.context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ApiConfig } from "@/configs/api-configs";
import clsx from "clsx";
import { Children } from "@/types/global";
import {
  CommentsReactions,
  ReactionContent,
} from "@/constants/comments.constants";
import { CommentReactionEnum } from "@/types/enums";
import { motion } from "framer-motion";

type CommentContainerProps = {
  className?: string;
  children: React.ReactNode;
};

const CommentBase = ({ className, children }: CommentContainerProps) => {
  return <div className={className}>{children}</div>;
};

const CommentCard = ({ className, children }: CommentContainerProps) => {
  return <Card className={className}>{children}</Card>;
};
CommentCard.displayName = "Comment.Card";

const CommentReplyToggle = ({
  className,
  children,
}: {
  className?: string;
  children: ({ status }: { status: boolean }) => React.ReactNode;
}) => {
  const { openReplies, setToggleReplies } = useComment();

  return (
    <div className={className} onClick={setToggleReplies}>
      {children({ status: openReplies })}
    </div>
  );
};
CommentReplyToggle.displayName = "Comment.ReplyToggle";

const CommentReplies = ({
  className,
  comment_id,
}: {
  className?: string;
  comment_id: string;
}) => {
  const { openReplies } = useComment();
  const { status, data, setData } = useReplies(comment_id, openReplies, true);
  const router = useRouter();
  const { addAlert } = useAlertStore();

  const handleDeleteComment = async ({
    commentId,
    parentId,
  }: {
    commentId: string;
    parentId: string;
  }) => {
    try {
      const url = `/api/post/comment/${commentId}`;
      const res = await apiFetch(url, { method: ApiConfig.delete.method });
      const data = await res?.json();

      if (data.ok) {
        setData((prev) =>
          prev ? prev.filter((c) => c.id !== commentId) : prev,
        );
        const cachedReplies = RepliesCache.get(parentId);
        if (cachedReplies) {
          for (const item of cachedReplies) {
            if (item.id === commentId) {
              cachedReplies.delete(item);
              break;
            }
          }
        }
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

  return (
    <div className={className} hidden={!openReplies}>
      {status === "loading" && <SkeletonReplyComment />}
      {status === "success" &&
        data?.map((c: CommentReplyType) => (
          <CommentContainer key={c.id}>
            <Comment className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <div className="flex gap-2.5">
                  <Comment.Profile>
                    {typeof c.user.profile_url === "string" ? (
                      <Image
                        src={c.user.profile_url}
                        width={40}
                        height={40}
                        alt="user-profile"
                        className="w-8 h-8 object-cover rounded-full"
                      />
                    ) : (
                      <Skeleton className="h-8 w-8 rounded-full" />
                    )}
                  </Comment.Profile>
                  <div className="flex flex-col gap-1.5">
                    <Comment.Header className="flex items-center gap-1.5">
                      <CardTitle
                        className="text-foreground cursor-pointer"
                        onClick={() => router.push(`/u/${c.user.username}`)}
                      >
                        {c.user.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {timeAgo(new Date(c.created_at))}
                      </CardDescription>
                    </Comment.Header>
                    <Comment.Content>
                      <CardDescription>{c.content}</CardDescription>
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
                              Are you sure you want to delete this comment?
                            </CardDescription>
                            <div className="flex gap-3">
                              <DropdownMenuItem className="focus:bg-transparent focus:text-inherit p-0">
                                <Button
                                  onClick={() =>
                                    handleDeleteComment({
                                      commentId: c.id,
                                      parentId: c.parent_id,
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
    </div>
  );
};
CommentReplies.displayName = "Comment.Replies";

const CommentContainer = ({
  className,
  children,
  defaultOpen = false,
}: CommentContainerProps & { defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);

  const setOpenReplies = (value: boolean) => setOpen(value);
  const setCloseReplies = () => setOpen(false);
  const setToggleReplies = () => setOpen((prev) => !prev);

  return (
    <CommentContext.Provider
      value={{
        openReplies: open,
        setOpenReplies,
        setCloseReplies,
        setToggleReplies,
      }}
    >
      <div className={className}>{children}</div>
    </CommentContext.Provider>
  );
};

const CommentPostContainer = ({
  children,
  className,
  post_id,
  comment_id,
}: {
  children: React.ReactNode;
  className?: string;
  post_id: number;
  comment_id: string;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] =
    useState<CommentPostContextType["status"]>("idle");

  const values = {
    ref: inputRef,
    status: status,
    setStatus: (value) => setStatus(value),
    post_id,
    comment_id,
  } as CommentPostContextType;

  return (
    <CommentPostContext.Provider value={values}>
      <div className={className}>{children}</div>
    </CommentPostContext.Provider>
  );
};

const CommentPostContainerButton = ({
  children,
  onSuccess,
}: {
  children: React.ReactNode;
  onSuccess?: () => void;
}) => {
  const { ref, setStatus, status, comment_id, post_id } = useCommentPost();
  const { addAlert } = useAlertStore();
  const { setOpenReplies } = useComment();
  const { setExpanded } = useContentToggle();

  const handleClick = async () => {
    try {
      setStatus("loading");
      const content = CommentReplyAPISchema.safeParse({
        content: ref.current?.value,
        comment_id,
        post_id,
      });

      if (!content.success) {
        const parsedErrors = content.error.issues.map((issue) =>
          JSON.parse(issue.message),
        );

        parsedErrors.forEach((error) =>
          addAlert({ ...error, type: "error", id: crypto.randomUUID() }),
        );

        return;
      }

      const res = await apiFetch("/api/post/comment/reply", {
        method: "POST",
        body: JSON.stringify(content.data),
      });
      const result = await res?.json();

      const parsed = CommentReplyAPIResSchema.safeParse(result);
      if (!parsed.success || !parsed.data.ok) {
        return addAlert({
          ...(parsed.data?.error || ERRORS.COMMENT_CREATION_FAILED),
          id: crypto.randomUUID(),
          type: "error",
        });
      } else if (parsed.success && parsed.data.ok) {
        const comment = parsed.data.comment;

        if (!comment) {
          addAlert({
            id: crypto.randomUUID(),
            type: "error",
            ...ERRORS.GENERIC_ERROR,
          });
          return;
        }

        const cacheKey = comment.parent_id || comment_id;
        const existing = RepliesCache.get(cacheKey);

        if (existing) {
          existing.add(comment);
        }

        setOpenReplies(true);
        setExpanded(false);
      }
      onSuccess?.();
    } catch {
      setStatus("idle");
    } finally {
      setStatus("idle");
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div onClick={handleClick}>
      <div hidden={status !== "loading"}>
        <CardDescription>
          <Spinner className="size-4.5" />
        </CardDescription>
      </div>
      <div hidden={status === "loading"}>{children}</div>
    </div>
  );
};

CommentPostContainerButton.displayName = "CommentPost.Button";

const CommentPostContainerInput = ({
  ...rest
}: DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>) => {
  const { ref } = useCommentPost();

  return <Input ref={ref} {...rest} />;
};

CommentPostContainerInput.displayName = "CommentPost.Input";

const CommentHeader = ({ className, children }: CommentContainerProps) => {
  return (
    <div className={clsx("flex items-center gap-1.5", className)}>
      {children}
    </div>
  );
};
CommentHeader.displayName = "Comment.Header";

const CommentContent = ({ className, children }: CommentContainerProps) => {
  return <div className={className}>{children}</div>;
};
CommentContent.displayName = "Comment.Content";

const CommentProfile = ({ className, children }: CommentContainerProps) => {
  return <div className={className}>{children}</div>;
};
CommentProfile.displayName = "Comment.Profile";

const CommentReactionBase = ({
  children,
  initialUserReaction = null,
  initialReactions,
  commentId,
}: Children & {
  initialUserReaction: UserReactionType | null;
  initialReactions: CommentReactionsCountType;
  commentId: string;
}) => {
  const [userReaction, setUserReaction] = useState<UserReactionType | null>(
    initialUserReaction,
  );
  const [reactions, setReactions] =
    useState<CommentReactionsCountType>(initialReactions);

  const values = {
    commentId,
    userReaction,
    reactions,
    increaseReaction: (type, count) =>
      setReactions((prev) => ({
        ...prev,
        [type]: { count: prev[type].count + count },
      })),
    decreaseReaction: (type, count) =>
      setReactions((prev) => ({
        ...prev,
        [type]: { count: prev[type].count - count },
      })),
    setUserReaction,
  } as CommentReactionContextType;

  return (
    <CommentReactionContext.Provider value={values}>
      {children}
    </CommentReactionContext.Provider>
  );
};

const CommentBaseReactionBtn = () => {
  const { userReaction } = useCommentReaction();
  return (
    <Button
      key={userReaction?.reactionId}
      variant="outline"
      size={"sm"}
      className="w-18 cursor-pointer"
    >
      <motion.div initial={false} animate={{ scale: [1, 2, 1] }}>
        {CommentsReactions[userReaction?.type || "LIKE"]}
      </motion.div>
    </Button>
  );
};

const CommentReactionBtn = ({
  reaction,
}: {
  reaction: {
    id: CommentReactionEnum;
    label: Capitalize<Lowercase<CommentReactionEnum>>;
    icon: ReactionContent;
  };
}) => {
  const { setUserReaction } = useCommentReaction();

  return (
    <div
      onClick={() =>
        setUserReaction({ reactionId: reaction.id, type: reaction.id })
      }
      className="cursor-pointer hover:opacity-55 hover:scale-125 transition-all hover:-translate-y-0.5"
    >
      {reaction.icon}
    </div>
  );
};

type CommentPostCompound = React.FC<{
  children: React.ReactNode;
  className?: string;
  post_id: number;
  comment_id: string;
}> & {
  Button: typeof CommentPostContainerButton;
  Input: typeof CommentPostContainerInput;
};

type CommentReactionCompound = React.FC<
  Children & {
    initialUserReaction: UserReactionType | null;
    initialReactions: CommentReactionsCountType;
    commentId: string;
  }
> & {
  BaseReaction: typeof CommentBaseReactionBtn;
  ReactionBtn: typeof CommentReactionBtn;
};

const CommentPost = Object.assign(CommentPostContainer, {
  Button: CommentPostContainerButton,
  Input: CommentPostContainerInput,
}) as CommentPostCompound;

type CommentCompound = React.FC<CommentContainerProps> & {
  Replies: typeof CommentReplies;
  ReplyToggle: typeof CommentReplyToggle;
  Card: typeof CommentCard;
  Header: typeof CommentHeader;
  Content: typeof CommentContent;
  Profile: typeof CommentProfile;
};

const Comment = Object.assign(CommentBase, {
  Replies: CommentReplies,
  ReplyToggle: CommentReplyToggle,
  Card: CommentCard,
  Header: CommentHeader,
  Content: CommentContent,
  Profile: CommentProfile,
}) as CommentCompound;

const CommentReaction = Object.assign(CommentReactionBase, {
  BaseReaction: CommentBaseReactionBtn,
  ReactionBtn: CommentReactionBtn,
}) as CommentReactionCompound;

export { Comment, CommentContainer, CommentPost, CommentReaction };
