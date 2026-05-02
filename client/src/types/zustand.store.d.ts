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
  comment: number | null;
  onClose: () => void;
  onOpen: (id: number) => void;
  onHandle: (id?: number) => void;
}

export interface CommentsType extends CommentSchemaType {
  user_reaction: UserReactionType | null,
  reactions: CommentReactionsCountType
}

export interface CommentsStoreType {
  comments: CommentsType[],
  setComments: (comments: CommentsType[]) => void,
  pushComments: (comments: CommentsType[]) => void, 
  incrementReplies: (commentId: string) => void,
  decrementReplies: (commentId: string) => void,
  deleteComment: (commentId: string) => void
}
