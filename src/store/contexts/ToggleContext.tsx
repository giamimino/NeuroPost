import { ToggleContextType } from "@/types/context";
import { createContext, useContext } from "react";

export const ToggleContext = createContext<ToggleContextType | null>(null);

export const useToggle = () => {
  const ctx = useContext(ToggleContext);
  if (!ctx)
    throw new Error("ToggleSwitch components must be used within ToggleSwitch");
  return ctx;
};
