import React, {
  DetailedHTMLProps,
  InputHTMLAttributes,
  useEffect,
  useReducer,
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
  useCommentReplies,
} from "@/store/contexts/CommentCntext";
import { Input } from "../ui/input";
import {
  CommentPostContextType,
  CommentReactionsCountType,
  CommentReducerAction,
  UserReactionType,
} from "@/types/context";
import { Spinner } from "../ui/spinner";
import { apiFetch } from "@/lib/apiFetch";
import {
  CommentReplyApiGetResSchema,
  CommentReplyAPIResSchema,
  CommentReplyAPISchema,
  CommentReplyType,
} from "@/schemas/comment/reply.schema";
import { useAlertStore } from "@/store/zustand/alertStore";
import { ERRORS } from "@/constants/error-handling";
import { SkeletonReplyComment } from "../ui/Skeleton-examples";
import { ChevronDown, ChevronUp, Ellipsis, Send } from "lucide-react";
import { Button } from "../ui/button";
import { ContentToggle, ContentToggleContainer } from "../ContentToggle";
import { timeAgo } from "@/utils/functions/timeAgo";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";
import { useRouter } from "next/navigation";
import { useContentToggle } from "@/store/contexts/ContentToggle.context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ApiConfig } from "@/configs/api-configs";
import clsx from "clsx";
import { Children, GenericStatus } from "@/types/global";
import {
  CommentsReactions,
  ReactionContent,
} from "@/constants/comments.constants";
import { CommentReactionEnum } from "@/types/enums";
import { motion } from "framer-motion";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "../ui/hover-card";
import { commentsReactions } from "@/app/post/[postId]/ClientPostPage";

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
  const { repliesCache, dispatch } = useCommentReplies();
  const replies = repliesCache.get(comment_id);

  const { openReplies } = useComment();
  const [status, setStatus] = useState<GenericStatus>("idle");
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
        dispatch({
          type: "DEL_REPLY",
          comment_id: parentId,
          reply_id: commentId,
        })
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

  const fetchReplies = async () => {
    try {
      setStatus("loading");

      const res = await apiFetch(
        `/api/post/comment/reply?comment_id=${comment_id}&limit=20`,
      );
      const data = await res?.json();

      const parsed = CommentReplyApiGetResSchema.safeParse(data);

      if (!parsed.success || !parsed.data.ok) {
        addAlert({
          id: crypto.randomUUID(),
          type: "error",
          ...(parsed.data?.error || ERRORS.GENERIC_ERROR),
        });
        return null;
      }

      const replies = parsed.data.comments;

      if (!replies) {
        addAlert({
          id: crypto.randomUUID(),
          type: "error",
          ...ERRORS.GENERIC_ERROR,
        });
        return null;
      }
      setStatus("success");
      return replies;
    } catch {
      setStatus("error");
      addAlert({
        id: crypto.randomUUID(),
        type: "error",
        ...ERRORS.GENERIC_ERROR,
      });
      return null;
    }
  };

  useEffect(() => {
    if (repliesCache.has(comment_id) || !openReplies) return;

    (async () => {
      const data = await fetchReplies();

      if (!data) return;

      dispatch({
        type: "SET_REPLIES",
        comment_id,
        replies: new Set(data),
      });
    })();
  }, [openReplies, comment_id]);

  return (
    <div className={className} hidden={!openReplies}>
      {status === "loading" && <SkeletonReplyComment />}
      {status === "success" &&
        replies &&
        Array.from(replies).map((c: CommentReplyType) => (
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
                    <div className="flex gap-2.5">
                      <div>
                        <CommentReaction
                          initialUserReaction={null}
                          initialReactions={{
                            ANGRY: { count: 0 },
                            HEART: { count: 0 },
                            LAUGH: { count: 0 },
                            LIKE: { count: 0 },
                            WOW: { count: 0 },
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
                              <CommentPost.Button
                              >
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
}: {
  children: React.ReactNode;
}) => {
  const { ref, setStatus, status, comment_id, post_id } = useCommentPost();
  const { dispatch } = useCommentReplies()
  const { addAlert } = useAlertStore();
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

        dispatch({
          type: "ADD_REPLY",
          comment_id,
          payload: comment
        })
        setExpanded(false);
      }
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

const CommentReactionVariants: Record<CommentReactionEnum & "NONE", string> = {
  NONE: "border shadow-xs dark:border-input",
  LIKE: "border border-[#3B82F6]",
  ANGRY: "border border-[#FF3B30]",
  HEART: "border border-[#FF2D55]",
  LAUGH: "border border-[#FBC02D]",
  WOW: "border border-[#29B6F6]",
} as const;

type CommentReducerState = {
  userReaction: UserReactionType | null;
  reactions: CommentReactionsCountType;
};

export function CommentReducer(
  state: CommentReducerState,
  action: CommentReducerAction,
): CommentReducerState {
  switch (action.type) {
    case "CHANGE_REACTION": {
      const { newReaction, prevReaction } = action.payload;

      const updated = { ...state.reactions };

      if (prevReaction) {
        updated[prevReaction.type] = {
          count: Math.max(0, updated[prevReaction.type].count - 1),
        };
      }

      updated[newReaction.type] = {
        count: Math.max(0, updated[newReaction.type].count + 1),
      };

      return {
        userReaction: newReaction,
        reactions: updated,
      };
    }
    case "DELETE_REACTION": {
      const { reactionType } = action;
      const updated = { ...state.reactions };

      updated[reactionType] = {
        count: Math.max(0, updated[reactionType].count - 1),
      };

      return {
        userReaction: null,
        reactions: updated,
      };
    }
    case "ADD_REACTION": {
      const payload = action.payload;
      const updated = { ...state.reactions };

      updated[payload.type] = {
        count: Math.max(0, updated[payload.type].count + 1),
      };

      return {
        reactions: updated,
        userReaction: payload,
      };
    }
    default:
      return state;
  }
}

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
  const [{ reactions, userReaction }, dispatch] = useReducer(CommentReducer, {
    reactions: initialReactions,
    userReaction: initialUserReaction,
  });

  const values = {
    commentId,
    userReaction,
    reactions,
    dispatch,
  };

  return (
    <CommentReactionContext.Provider value={values}>
      {children}
    </CommentReactionContext.Provider>
  );
};

const CommentBaseReactionBtn = () => {
  const { userReaction, dispatch, commentId } = useCommentReaction();
  const { addAlert } = useAlertStore();

  const handleReaction = async () => {
    if (userReaction === null) {
      const res = await fetch("/api/post/comment/reaction", {
        ...ApiConfig.post,
        body: JSON.stringify({ commentId, type: "LIKE" }),
      });
      const data = await res.json();

      if (data.ok) {
        dispatch({
          type: "ADD_REACTION",
          payload: data.reaction,
        });
      } else if (data.error) {
        addAlert({
          id: crypto.randomUUID(),
          type: "error",
          ...data.error,
        });
      }
    } else if (userReaction) {
      const res = await fetch("/api/post/comment/reaction", {
        ...ApiConfig.delete,
        body: JSON.stringify({ reactionId: userReaction.reactionId }),
      });
      const data = await res.json();

      if (data.ok) {
        dispatch({
          type: "DELETE_REACTION",
          reactionType: userReaction.type,
        });
      } else if (data.error) {
        addAlert({
          id: crypto.randomUUID(),
          type: "error",
          ...data.error,
        });
      }
    }
  };

  return (
    <Button
      key={userReaction?.reactionId}
      variant="none"
      size={"sm"}
      className={clsx(
        "w-18 cursor-pointer bg-background dark:bg-input/30",
        "hover:bg-accent hover:text-accent-foreground dark:hover:bg-input/50",
        CommentReactionVariants[
          (userReaction?.type || "NONE") as keyof typeof CommentReactionVariants
        ],
      )}
      onClick={handleReaction}
    >
      <motion.div
        initial={false}
        animate={{ scale: userReaction ? [1, 1.7, 1] : 1 }}
      >
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
  const { reactions, userReaction, commentId, dispatch } = useCommentReaction();
  const { addAlert } = useAlertStore();

  const handleReaction = async () => {
    if (!userReaction) {
      const res = await fetch("/api/post/comment/reaction", {
        ...ApiConfig.post,
        body: JSON.stringify({ commentId, type: reaction.id }),
      });
      const data = await res.json();

      if (data.ok) {
        dispatch({
          type: "ADD_REACTION",
          payload: data.reaction,
        });
      } else if (data.error) {
        addAlert({
          id: crypto.randomUUID(),
          type: "error",
          ...data.error,
        });
      }
    } else if (userReaction.reactionId && userReaction.type === reaction.id) {
      const res = await fetch("/api/post/comment/reaction", {
        ...ApiConfig.delete,
        body: JSON.stringify({ reactionId: userReaction.reactionId }),
      });
      const data = await res.json();

      if (data.ok) {
        dispatch({
          type: "DELETE_REACTION",
          reactionType: userReaction.type,
        });
      } else if (data.error) {
        addAlert({
          id: crypto.randomUUID(),
          type: "error",
          ...data.error,
        });
      }
    } else if (userReaction.reactionId && userReaction.type !== reaction.id) {
      const res = await fetch("/api/post/comment/reaction", {
        ...ApiConfig.put,
        body: JSON.stringify({
          reactionId: userReaction.reactionId,
          type: reaction.id,
        }),
      });
      const data = await res.json();

      if (data.ok) {
        dispatch({
          type: "CHANGE_REACTION",
          payload: {
            newReaction: data.reaction,
            prevReaction: userReaction,
          },
        });
      } else if (data.error) {
        addAlert({
          id: crypto.randomUUID(),
          type: "error",
          ...data.error,
        });
      }
    }
  };

  return (
    <div
      onClick={handleReaction}
      className="cursor-pointer hover:opacity-55 hover:scale-125 transition-all hover:-translate-y-0.5 flex gap-0.5 items-center"
    >
      <p className="text-muted-foreground text-sm">
        {reactions[reaction.id].count}
      </p>
      <p>{reaction.icon}</p>
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
