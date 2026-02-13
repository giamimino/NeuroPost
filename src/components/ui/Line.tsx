import { cn } from "@/lib/utils";
import React from "react";

const Line = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "w-full h-0.5 bg-muted-foreground/20 rounded-full mb-2",
        className,
      )}
    ></div>
  );
};

export default Line;
