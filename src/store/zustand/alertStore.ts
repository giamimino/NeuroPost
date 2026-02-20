import { AlertStoreType } from "@/types/zustand.store";
import { create } from "zustand";

export const useAlertStore = create<AlertStoreType>((set) => ({
  alerts: [{ title: "test", duration: 3000, description: "test", type: "error", id: "dqpwdq" }],
  addAlert: (alert) => set((state) => ({ alerts: [...state.alerts, alert] })),
  removeAlert: (id) =>
    set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),
}));
