import { ProfileStatusStoreType } from "@/types/zustand.store";
import { create } from "zustand";

export const useProfileStatusStore = create<ProfileStatusStoreType>((set) => ({
  data: {
    hasNewNotifications: false,
  },
  editData: (key, value) =>
    set((state) => ({ data: { ...state.data, [key]: value } })),
  setData: (data) => set(() => ({ data })),
}));
