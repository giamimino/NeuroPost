import React, {
  DetailedHTMLProps,
  HTMLAttributes,
  InputHTMLAttributes,
  useRef,
  useState,
} from "react";
import { Card, CardDescription } from "../ui/card";
import {
  CommentContext,
  CommentPostContext,
  useComment,
  useCommentPost,
} from "@/store/contexts/CommentCntext";
import { Input } from "../ui/input";
import { CommentPostContextType } from "@/types/context";
import fakeFetch from "@/utils/functions/fakeFetch";
import { Spinner } from "../ui/spinner";
import { apiFetch } from "@/lib/apiFetch";
import {
  CommentReplyAPIResSchema,
  CommentReplyAPISchema,
} from "@/schemas/comment/reply.schema";
import { useAlertStore } from "@/store/zustand/alertStore";
import { ERRORS } from "@/constants/error-handling";

type CommentContainerProps = {
  className?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

const CommentBase = ({ className, children }: CommentContainerProps) => {
  return <div className={className}>{children}</div>;
};

const CommentCard = ({ className, children }: CommentContainerProps) => {
  return <Card className={className}>{children}</Card>;
};
CommentCard.displayName = "Comment.Card";

const CommentReplyToggle = ({ className, children }: CommentContainerProps) => {
  const { setToggleReplies } = useComment();

  return (
    <div className={className} onClick={setToggleReplies}>
      {children}
    </div>
  );
};
CommentReplyToggle.displayName = "Comment.ReplyToggle";

const CommentReplies = ({ className, children }: CommentContainerProps) => {
  const { openReplies } = useComment();

  return (
    <div className={className} hidden={!openReplies}>
      {children}
    </div>
  );
};
CommentReplies.displayName = "Comment.Replies";

const CommentsContainer = ({
  className,
  children,
  defaultOpen = false,
}: CommentContainerProps) => {
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

      const { data, success, error } =
        CommentReplyAPIResSchema.safeParse(result);
      if (!success) {
        return addAlert({
          ...ERRORS.COMMENT_CREATION_FAILED,
          type: "error",
          id: crypto.randomUUID(),
        });
      } else if (!data.ok && data.error) {
        return addAlert({
          ...data.error,
          id: crypto.randomUUID(),
          type: "error",
        });
      } else if (data.ok) {
        return console.log(data);
      }
      onSuccess?.();
    } catch (error) {
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

type CommentPostCompound = React.FC<{
  children: React.ReactNode;
  className?: string;
  post_id: number;
  comment_id: string;
}> & {
  Button: typeof CommentPostContainerButton;
  Input: typeof CommentPostContainerInput;
};

const CommentPost = Object.assign(CommentPostContainer, {
  Button: CommentPostContainerButton,
  Input: CommentPostContainerInput,
}) as CommentPostCompound;

type CommentCompound = React.FC<CommentContainerProps> & {
  Replies: typeof CommentReplies;
  ReplyToggle: typeof CommentReplyToggle;
  Card: typeof CommentCard;
};

const Comment = Object.assign(CommentBase, {
  Replies: CommentReplies,
  ReplyToggle: CommentReplyToggle,
  Card: CommentCard,
}) as CommentCompound;

export { Comment, CommentsContainer, CommentPost };
