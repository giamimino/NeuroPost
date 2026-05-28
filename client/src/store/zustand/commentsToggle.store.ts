import { CommentToggleStoreType } from "@/types/zustand.store";
import { create } from "zustand";

export const useCommentToggleStore = create<CommentToggleStoreType>((set) => ({
  post: null,
  onOpen: (id, append) => set(() => ({ post: { id, append } })),
  setAppend: (append) =>
    set((state) => ({ post: state.post ? { ...state.post, append } : null })),
  onClose: () => set(() => ({ post: null })),
  onHandle: (id) => set(() => ({ post: id ? { id, append: false } : null })),
}));
