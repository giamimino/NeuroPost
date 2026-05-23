import useUserStatsPreview from "@/hook/useUserStatsPreview";
import {
  UserStatsPreviewContext,
  useUserStatsPreviewCtx,
} from "@/store/contexts/UserStats.context";
import { Children, StatsPreviewType } from "@/types/global";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardDescription, CardTitle } from "../ui/card";
import { UserStatsPreviewContextType } from "@/types/context";
import { X } from "lucide-react";
import { UserStatsPreviewUserType } from "@/types/neon";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { SkeletonUser } from "../ui/Skeleton-examples";

const UserStatsProvider = ({
  children,
  user,
}: {
  children: React.ReactNode;
  className?: string;
  user: UserStatsPreviewContextType["user"];
}) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<Lowercase<StatsPreviewType>>();
  const cacheRef = useRef(
    new Map<string, (UserStatsPreviewUserType & { likes_count?: string })[]>(),
  );

  useEffect(() => {
    cacheRef.current.clear();
  }, [user.username]);

  const values = useMemo(
    () =>
      ({
        open,
        type,
        setOpen: (value) => setOpen(value),
        setType: (type) => setType(type),
        cacheRef,
        user,
      }) as UserStatsPreviewContextType,
    [open, type, user],
  );

  return (
    <UserStatsPreviewContext value={values}>{children}</UserStatsPreviewContext>
  );
};

const UserStatsTrigger = ({
  children,
  type,
  className,
}: Children & {
  type: Lowercase<StatsPreviewType>;
  className?: string;
}) => {
  const { setType, setOpen } = useUserStatsPreviewCtx();

  const handleTrigger = () => {
    setOpen(true);
    setType(type);
  };

  return (
    <div className={className} onClick={handleTrigger}>
      {children}
    </div>
  );
};

const UserStatsContent = ({ children }: Children) => {
  const { type, open, setOpen, user } = useUserStatsPreviewCtx();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!open || !element) return;

    const handleClick = (e: PointerEvent) => {
      e.preventDefault();

      if (!element.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClick);

    return () => document.removeEventListener("click", handleClick);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex justify-center items-center p-3"
        >
          <Card ref={wrapperRef} className="w-full h-[60vh] max-w-100 p-6">
            <div className="flex flex-col gap-2 border-b border-accent pb-2">
              <div className="text-center">
                <CardTitle>{user.username}</CardTitle>
              </div>
              <div className="flex justify-between gap-2">
                <div>
                  {user.count[type]}{" "}
                  {`${type[0].toUpperCase()}${type.slice(1, type.length)}`}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="cursor-pointer"
                >
                  <X />
                </button>
              </div>
            </div>
            {children}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const UserStatsUserComponents = {
  likes: ({
    name,
    profile_url,
    username,
    likes_count,
  }: UserStatsPreviewUserType & { likes_count?: string }) => {
    if (!likes_count) return;

    return (
      <div className="p-2 flex justify-between">
        <div className="flex gap-2.5 items-center">
          <Image
            src={profile_url}
            alt={username}
            width={42}
            height={42}
            className="w-8 h-8 object-cover rounded-full select-none"
          />
          <CardTitle>{name}</CardTitle>
        </div>
        <CardDescription>{likes_count}</CardDescription>
      </div>
    );
  },
  following: ({ name, profile_url, username }: UserStatsPreviewUserType) => {
    return (
      <div className="p-2 flex justify-between">
        <div className="flex gap-2.5 items-center">
          <Image
            src={profile_url}
            alt={username}
            width={42}
            height={42}
            className="w-8 h-8 object-cover rounded-full select-none"
          />
          <CardTitle>{name}</CardTitle>
        </div>
      </div>
    );
  },
  followers: ({ name, profile_url, username }: UserStatsPreviewUserType) => {
    return (
      <div className="p-2 flex justify-between">
        <div className="flex gap-2.5 items-center">
          <Image
            src={profile_url}
            alt={username}
            width={42}
            height={42}
            className="w-8 h-8 object-cover rounded-full select-none"
          />
          <CardTitle>{name}</CardTitle>
        </div>
      </div>
    );
  },
};

const UserStatsList = () => {
  const { type, open, user, cacheRef } = useUserStatsPreviewCtx();
  const { data, status, loadMore, hasMore } = useUserStatsPreview(
    type,
    user.username,
    open,
    cacheRef,
  );

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const firstFireRef = useRef(true);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const handleLoadMore = async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;

    try {
      await loadMore();
    } finally {
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    const el = loaderRef.current;
    
    if (!el) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (firstFireRef.current) {
          firstFireRef.current = false;
          return;
        }
        if (entry.isIntersecting && hasMoreRef.current) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observerRef.current.observe(el);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <div data-lenis-prevent className="flex flex-col gap-1 overflow-y-auto">
      {data?.map((item, i) => (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: (i % 10) * 0.08,
            type: "spring",
            stiffness: 110,
            damping: 18,
          }}
          key={item.username}
        >
          {UserStatsUserComponents[type](item)}
        </motion.div>
      ))}
      <div ref={loaderRef} className="w-full min-h-10 shrink-0" />
      {status === "loading" &&
        Array.from({ length: 6 }).map((_, i) => (
          <SkeletonUser className="w-full p-2" key={i} />
        ))}
    </div>
  );
};

type UserStatsPreviewCompound = React.FC<
  Children & {
    className?: string;
    user: UserStatsPreviewContextType["user"];
  }
> & {
  Trigger: typeof UserStatsTrigger;
  Content: typeof UserStatsContent;
  List: typeof UserStatsList;
};

const UserStats = Object.assign(UserStatsProvider, {
  Trigger: UserStatsTrigger,
  Content: UserStatsContent,
  List: UserStatsList,
}) as UserStatsPreviewCompound;

export { UserStats };
