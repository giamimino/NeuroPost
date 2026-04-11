import { ContentContextType } from "@/types/context";
import { createContext, useContext } from "react";

export const ContentToggleContext = createContext<ContentContextType | null>(
  null,
);

export const useContentToggle = () => {
  const ctx = useContext(ContentToggleContext);
  if(!ctx) throw new Error("useContentToggle must be used within a ContentToggleProvider");
  return ctx;
}
