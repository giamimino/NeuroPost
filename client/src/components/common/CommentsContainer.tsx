import React, { useState } from "react";
import { Card } from "../ui/card";
import { CommentContext, useComment } from "@/store/contexts/CommentCntext";

type CommentContainerProps = {
  className?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};


const CommentBase = ({
  className,
  children,
}: CommentContainerProps) => {
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

export { Comment, CommentsContainer };