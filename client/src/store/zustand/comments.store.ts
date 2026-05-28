import { CommentsStoreType } from "@/types/zustand.store";
import { create } from "zustand";

export const useCommentsStore = create<CommentsStoreType>((set) => ({
  comments: [],
  setComments: (comments) => set(() => ({ comments })),
  pushComments: (comments) =>
    set((state) => ({ comments: [...(state.comments ?? []), ...comments] })),
  newComment: (comment) =>
    set((state) => ({
      comments: [
        {
          ...comment,
          reactions: {
            LIKE: { count: 0 },
            LAUGH: { count: 0 },
            WOW: { count: 0 },
            ANGRY: { count: 0 },
            HEART: { count: 0 },
          },
        },
        ...(state.comments ?? []),
      ],
    })),
  incrementReplies: (commentId) =>
    set((state) => ({
      comments: state.comments.map((c) =>
        c.id === commentId
          ? { ...c, replies_count: Math.max(0, c.replies_count + 1) }
          : c,
      ),
    })),
  decrementReplies: (commentId) =>
    set((state) => ({
      comments: state.comments.map((c) =>
        c.id === commentId
          ? { ...c, replies_count: Math.max(0, c.replies_count - 1) }
          : c,
      ),
    })),
  deleteComment: (commentId) =>
    set((state) => ({
      comments: state.comments.filter((c) => c.id !== commentId),
    })),
  clearComments: () => set(() => ({ comments: [] })),
}));
