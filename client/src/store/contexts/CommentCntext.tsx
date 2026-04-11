import { CommentContextType } from "@/types/context";
import { createContext, useContext } from "react";

export const CommentContext = createContext<CommentContextType | null>(null);

CommentContext.displayName = "CommentContext";

export const useComment = () => {
  const ctx = useContext(CommentContext);
  if (!ctx)
    throw new Error("Comment components must be used within CommentContext");
  return ctx;
};
