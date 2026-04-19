import { cn } from "@/lib/utils";
import { Children } from "@/types/global";
import React from "react";

const BlurWrapper = ({
  children,
  className,
}: Children & { className?: string }) => {
  return (
    <div
      className={cn(
        `flex flex-col p-6 rounded-3xl border border-white/10 gap-6 bg-black/15 backdrop-blur-lg`,
        className,
      )}
    >
      {children}
    </div>
  );
};

export default BlurWrapper;
