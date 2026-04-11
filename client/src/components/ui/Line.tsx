import { cn } from "@/lib/utils";
import React from "react";

const Line = ({ className, orientation }: { className?: string; orientation?: "horizontal" | "vertical" }) => {
  return (
    <div
      className={cn(
        orientation === "vertical"
          ? "w-0.5 h-full bg-muted-foreground/20 rounded-full ml-2"
          : "w-full h-0.5 bg-muted-foreground/20 rounded-full mb-2",
        className,
      )}
    ></div>
  );
};

export default Line;
