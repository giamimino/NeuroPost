import {
  CommentContextType,
  CommentPostContextType,
  CommentReactionContextType,
} from "@/types/context";
import { createContext, useContext } from "react";

export const CommentContext = createContext<CommentContextType | null>(null);

CommentContext.displayName = "CommentContext";

export const useComment = () => {
  const ctx = useContext(CommentContext);
  if (!ctx)
    throw new Error("Comment components must be used within CommentContext");
  return ctx;
};

export const CommentPostContext = createContext<CommentPostContextType | null>(
  null,
);

export const useCommentPost = () => {
  const ctx = useContext(CommentPostContext);
  if (!ctx)
    throw new Error(
      "CommentPost components must be used within CommentPostContext",
    );
  return ctx;
};

export const CommentReactionContext =
  createContext<CommentReactionContextType | null>(null);

export const useCommentReaction = () => {
  const ctx = useContext(CommentReactionContext);
  if (!ctx)
    throw new Error(
      "CommentReactions components must be used within CommentReaction",
    );
  return ctx;
};
