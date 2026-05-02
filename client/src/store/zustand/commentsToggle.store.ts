import { CommentToggleStoreType } from "@/types/zustand.store";
import { create } from "zustand";

export const useCommentToggleStore = create<CommentToggleStoreType>((set) => ({
  comment: null,
  onOpen: (id) => set(() => ({ comment: id })),
  onClose: () => set(() => ({ comment: null })),
  onHandle: (id) => set(() => ({ comment: id || null })),
}));
