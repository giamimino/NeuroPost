import { CardDescription } from "./card";
import clsx from "clsx";

function TagItem({
  tag,
  onClick,
  variant = "default",
}: {
  tag: string;
  onClick?: () => void;
  variant?: "default" | "none";
}) {
  return (
    <div
      className={clsx(
        "p-1 px-2 rounded-sm truncate",
        variant === "default" && "border border-card-border",
        variant === "none" && "",
      )}
      onClick={onClick}
    >
      <CardDescription className="cursor-pointer hover:text-black dark:hover:text-amber-50/90">
        {tag}
      </CardDescription>
    </div>
  );
}

export { TagItem };
