import { AlertStoreType } from "@/types/zustand.store";
import { create } from "zustand";

export const useAlertStore = create<AlertStoreType>((set) => ({
  alerts: [],
  addAlert: (alert) => set((state) => ({ alerts: [...state.alerts, alert] })),
  removeAlert: (id) =>
    set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),
}));
