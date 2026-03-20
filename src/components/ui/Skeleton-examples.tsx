import clsx from "clsx";
import { Card, CardContent, CardFooter, CardHeader } from "./card";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

function SkeletonCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="aspect-video w-full" />
      </CardContent>
    </Card>
  );
}

function SkeletonPost({ className }: { className?: string }) {
  return (
    <Card className={cn("gap-4", className)}>
      <CardHeader>
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="w-full aspect-4/1" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-4 w-1/3" />
      </CardFooter>
    </Card>
  );
}

function SkeletonPosts({
  className,
  length = 5,
  postClassName,
}: {
  className?: string;
  length: number;
  postClassName?: string;
}) {
  return (
    <div
      className={cn("flex gap-6 flex-wrap justify-center w-full", className)}
    >
      {Array.from({ length }).map((_, i) => (
        <SkeletonPost className={cn("w-1/4", postClassName)} key={i} />
      ))}
    </div>
  );
}

function SkeletonArticle({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2.5 w-full", className)}>
      <Skeleton className="w-1/3 h-5" />
      <Skeleton className="w-2/3 h-5" />
    </div>
  );
}

function SkeletonComment({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2.5 w-full", className)}>
      <Skeleton className="w-1/4 h-5" />
      <Skeleton className="w-3/4 h-10" />
    </div>
  );
}

function SkeletonComments({
  className,
  length = 6,
  commentClassName,
}: {
  className?: string;
  length?: number;
  commentClassName?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {Array.from({ length }).map((_, i) => (
        <SkeletonComment key={i} className={commentClassName} />
      ))}
    </div>
  );
}

function SkeletonProfile({ className }: { className?: string }) {
  return (
    <div className={clsx("w-full flex pl-20 pb-5 gap-4", className)}>
      <Skeleton className="w-20.5 h-20.5 rounded-full" />
      <div className="flex flex-col gap-2.5">
        <div>
          <Skeleton className="w-25 h-5" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="w-12 h-5" />
          ))}
        </div>
        <div>
          <Skeleton className="w-65 h-20" />
        </div>
      </div>
    </div>
  );
}

function SkeletonNotification({ className }: { className?: string }) {
  return (
    <div className={clsx("flex flex-col gap-2", className)}>
      <Skeleton className="w-1/3 h-6" />
      <Skeleton className="w-full h-8" />
    </div>
  );
}

function SkeletonNotifications({
  className,
  length,
}: {
  className?: string;
  length: number;
}) {
  return (
    <div className={clsx("flex flex-col gap-5", className)}>
      {Array.from({ length }).map((_, i) => (
        <SkeletonNotification key={i} />
      ))}
    </div>
  );
}

function SkeletonFriendRequest() {
  return (
    <div className="w-full flex flex-col gap-3">
      <Skeleton className="w-full h-40" />
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-1/4 h-4" />
    </div>
  );
}

function SkeletonFriendRequests({
  length = 6,
  className,
}: {
  length?: number;
  className?: string;
}) {
  return Array.from({ length }).map((_, i) => (
    <SkeletonFriendRequest key={i} {...(className ? { className } : {})} />
  ));
}

function SkeletonUser() {
  return (
    <div className={"flex gap-1.5"}>
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="w-16 h-3.5" />
        <Skeleton className="w-16 h-3.5" />
      </div>
    </div>
  );
}

function SkeletonUsers({ length = 6 }: { length?: number }) {
  return (
    <>
      {Array.from({ length }).map((_, i) => (
        <SkeletonUser key={i} />
      ))}
    </>
  );
}

export {
  SkeletonCard,
  SkeletonPost,
  SkeletonArticle,
  SkeletonPosts,
  SkeletonComment,
  SkeletonComments,
  SkeletonProfile,
  SkeletonNotification,
  SkeletonNotifications,
  SkeletonFriendRequest,
  SkeletonFriendRequests,
  SkeletonUser,
  SkeletonUsers,
};
