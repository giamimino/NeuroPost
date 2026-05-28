import { CommentSchemaType } from "@/schemas/comment/comment.schema";
import { CommentReactionsCountType, UserReactionType } from "./context";

export interface AlertType {
  id: string;
  title: string;
  description?: string;
  type: "success" | "warning" | "error" | "info";
  duration?: number;
}

export interface AlertStoreType {
  alerts: AlertType[];
  addAlert: (alert: AlertType) => void;
  removeAlert: (id: string) => void;
}

export interface CommentToggleStoreType {
  post: { id: number; append: boolean } | null;
  onClose: () => void;
  setAppend: (append: boolean) => void;
  onOpen: (id: number, append: boolean) => void;
  onHandle: (id?: number) => void;
}

export interface CommentsType extends CommentSchemaType {
  user_reaction: UserReactionType | null;
  reactions: CommentReactionsCountType;
}

export interface CommentsStoreType {
  comments: CommentsType[];
  setComments: (comments: CommentsType[]) => void;
  pushComments: (comments: CommentsType[]) => void;
  newComment: (comment: CommentsType) => void;
  incrementReplies: (commentId: string) => void;
  decrementReplies: (commentId: string) => void;
  deleteComment: (commentId: string) => void;
  clearComments: () => void;
}
