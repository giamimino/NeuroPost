import { ContentToggleContext, useContentToggle } from "@/store/contexts/ContentToggle.context";
import { ContentContextType } from "@/types/context";
import { useState } from "react";

type ContentToggleProps = {
  children: React.ReactNode;
  defaultExpanded?: boolean;
};

export const ContentToggleContainer = ({
  children,
  defaultExpanded = false,
}: ContentToggleProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const value = {
    expanded,
    toggleExpanded: () => setExpanded(!expanded),
    setExpanded,
  } as ContentContextType

  return (
    <ContentToggleContext.Provider value={value}>
      {children}
    </ContentToggleContext.Provider>
  )
};

export const ContentToggle = {};