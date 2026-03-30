import { CommentsStoreType } from "@/types/zustand.store";
import { create } from "zustand";

export const useCommentsStore = create<CommentsStoreType>((set) => ({
  comment: null,
  onOpen: (id) => set(() => ({ comment: id })),
  onClose: () => set(() => ({ comment: null })),
  onHandle: (id) => set(() => ({ comment: id || null })),
}));
