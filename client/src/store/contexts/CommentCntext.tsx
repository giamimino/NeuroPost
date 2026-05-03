import {
  CommentContextType,
  CommentPostContextType,
  CommentReactionContextType,
  CommentRepliesContextType,
} from "@/types/context";
import { createContext, useContext } from "react";

const CommentContext = createContext<CommentContextType | null>(null);

CommentContext.displayName = "CommentContext";

const useComment = () => {
  const ctx = useContext(CommentContext);
  if (!ctx)
    throw new Error("Comment components must be used within CommentContext");
  return ctx;
};

const CommentPostContext = createContext<CommentPostContextType | null>(null);

const useCommentPost = () => {
  const ctx = useContext(CommentPostContext);
  if (!ctx)
    throw new Error(
      "CommentPost components must be used within CommentPostContext",
    );
  return ctx;
};

const CommentReactionContext = createContext<CommentReactionContextType | null>(
  null,
);

const useCommentReaction = () => {
  const ctx = useContext(CommentReactionContext);
  if (!ctx)
    throw new Error(
      "CommentReactions components must be used within CommentReaction",
    );
  return ctx;
};

const CommentRepliesContext = createContext<CommentRepliesContextType | null>(
  null,
);

const useCommentReplies = () => {
  const ctx = useContext(CommentRepliesContext);

  if (!ctx)
    throw new Error(
      "CommentReplies components most be used within CommentRepliesProvider",
    );

  return ctx;
};

export {
  CommentContext,
  useComment,
  CommentPostContext,
  useCommentPost,
  CommentReactionContext,
  useCommentReaction,
  CommentRepliesContext,
  useCommentReplies,
};
