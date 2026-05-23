import { UserStatsPreviewContextType } from "@/types/context";
import { createContext, useContext } from "react";

const UserStatsPreviewContext =
  createContext<UserStatsPreviewContextType | null>(null);

const useUserStatsPreviewCtx = () => {
  const ctx = useContext(UserStatsPreviewContext);
  if (!ctx)
    throw new Error("components must be used within UserStatsPreviewContext");
  return ctx;
};

export { UserStatsPreviewContext, useUserStatsPreviewCtx };
