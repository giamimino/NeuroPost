import {
  ContentToggleContext,
  useContentToggle,
} from "@/store/contexts/ContentToggle.context";
import { ContentContextType } from "@/types/context";
import React, { useState } from "react";

type ContentToggleProps = {
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
};

const ContentToggleContainer = ({
  children,
  defaultExpanded = false,
}: ContentToggleProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const value = {
    expanded,
    toggleExpanded: () => setExpanded(!expanded),
    setExpanded,
  } as ContentContextType;

  return (
    <ContentToggleContext.Provider value={value}>
      {children}
    </ContentToggleContext.Provider>
  );
};

const ContentToggleBase = ({ children, className }: ContentToggleProps) => {
  return <div className={className}>{children}</div>;
};

const Content = ({ children, className }: ContentToggleProps) => {
  const { expanded } = useContentToggle();

  return (
    <div className={className} hidden={!expanded}>
      {children}
    </div>
  );
};

const ContentToggleController = ({
  children,
  className,
}: ContentToggleProps) => {
  const { toggleExpanded } = useContentToggle();

  return (
    <div onClick={toggleExpanded} className={className}>
      {children}
    </div>
  );
};

type ContentToggleCompound = React.FC<ContentToggleProps> & {
  Content: React.FC<ContentToggleProps>;
  Controller: React.FC<ContentToggleProps>;
};

const ContentToggle = Object.assign(ContentToggleBase, {
  Content,
  Controller: ContentToggleController,
}) as ContentToggleCompound;

export { ContentToggleContainer, ContentToggle };