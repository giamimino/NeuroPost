"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Heart, Menu, MessageCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Card, CardHeader, CardTitle } from "./ui/card";
import Line from "./ui/Line";
import clsx from "clsx";

const pages = [
  { label: "Home", url: "/", type: "router" },
  { label: "Profile", url: "/profile", type: "router" },
];

const Header = () => {
  const [show, setShow] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;

      ticking.current = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;

        if (lastScrollY.current < scrollY && show) {
          setShow(false);
        } else if (lastScrollY.current > scrollY && !show) {
          setShow(true);
        }

        lastScrollY.current = scrollY;
        ticking.current = false;
      });
    };

    document.addEventListener("scroll", onScroll);

    return () => document.removeEventListener("scroll", onScroll);
  }, [show]);
  return (
    <header
      className={`w-full px-12 flex justify-center items-center py-3 fixed top-0 left-0 transition-all duration-300`}
    >
      <motion.div
        initial={{ opacity: 0, y: "-100%" }}
        animate={show ? { opacity: 1, y: 0 } : { opacity: 0.5, y: "-150%" }}
        transition={{ stiffness: 80, type: "spring", damping: 20 }}
        layout
        className={`flex gap-4 items-center px-5 py-2.5 dark:bg-card
       rounded-full border-input ring ring-ring/80 z-99`}
      >
        {pages.map((page) => (
          <div
            onClick={
              page.type === "router" ? () => router.push(page.url) : undefined
            }
            className={`${page.label === "Logout" ? "text-red-400" : "text-muted-foreground"} font-inter text-center font-medium 
              tracking-tight cursor-pointer px-2.5 py-1.5 hover:bg-active-bg ${page.label === "Logout" ? "hover:text-red-500" : "hover:text-white"} hover:tracking-wide 
              transition-all duration-300 rounded-xl hover:px-4`}
            key={page.url}
          >
            {page.label}
          </div>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"outline"} className="cursor-pointer">
              Search
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            sideOffset={20}
            className="max-h-60 overflow-y-auto mr-5"
          >
            <DropdownMenuItem
              onClick={() => router.push("/search/posts")}
              className="cursor-pointer"
            >
              <p>Posts</p>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/search/users")}
              className="cursor-pointer"
            >
              <p>Users</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    </header>
  );
};

const profileNavigationPages: {
  url: string;
  label: string;
  variant:
    | "ghost"
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary";
}[] = [
  { url: "p/create", label: "Upload", variant: "default" },
  { url: "", label: "Profile", variant: "ghost" },
  { url: "saves/likes", label: "Saves", variant: "ghost" },
  { url: "edit", label: "Edit", variant: "ghost" },
  { url: "friends", label: "Friends", variant: "ghost" },
  { url: "settings", label: "Settings", variant: "ghost" },
];

const ProfileNavigation = () => {
  const [show, setShow] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = () => window.innerWidth < 480;

  const handleClick = (pageUrl: string) => {
    if (isMobile()) {
      setShow(false);
    }

    router.push(`/profile/${pageUrl}`);
  };

  useEffect(() => {
    if (!window) return;
    const hide = () => {
      if (isMobile()) {
        setShow(false);
      }
    };
    hide();
  }, []);

  return (
    <div className="flex flex-col gap-2.5 w-fit">
      <div className="hidden max-xs:block w-fit">
        <Button
          onClick={() => setShow((prev) => !prev)}
          variant={"none"}
          size={"md"}
          className="rounded-md border bg-secondary 
                shadow-xs hover:bg-accent hover:text-accent-foreground 
                 dark:border-input dark:hover:brightness-115 
                cursor-pointer w-fit self-end"
        >
          <Menu />
        </Button>
      </div>
      <motion.div
        animate={show ? "open" : "closed"}
        variants={{
          open: { opacity: 1, height: "auto", width: "auto", y: 0 },
          closed: { opacity: 1, height: 0, width: 0, y: 20 },
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
        initial={{
          opacity: 0,
          y: 10,
        }}
        className=" overflow-hidden relative"
      >
        <Card>
          <CardHeader>
            <CardTitle>Menu</CardTitle>
          </CardHeader>
          <div>
            <nav>
              {profileNavigationPages.map((page) => (
                <Button
                  variant={page.variant}
                  key={`${page.label}`}
                  className={"w-full rounded-none cursor-pointer"}
                  onClick={() => handleClick(page.url)}
                >
                  <p
                    className={
                      pathname === page.url
                        ? "text-current font-bold"
                        : "text-current/90"
                    }
                  >
                    {page.label}
                  </p>
                </Button>
              ))}
            </nav>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

const ActivitySections = [
  { label: "Likes", icon: <Heart width={15} />, url: "/profile/saves/likes" },
  {
    label: "Comments",
    icon: <MessageCircle width={15} className="-scale-x-100" />,
    url: "/profile/saves/comments",
  },
];

const SavesHeader = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <CardHeader className="gap-0">
      <div className="flex gap-5 justify-center">
        {ActivitySections.map((item) => (
          <div
            key={`${item.label}`}
            className={`
                    flex font-plusJakartaSans uppercase tracking-wider text-xs items-center font-medium flex-1 justify-center
                  `}
          >
            <button
              className={clsx(
                "flex gap-2.5 items-center cursor-pointer hover:opacity-80 border-b pb-1.5",
                "transition duration-300 ease-initial border-transparent",
                pathname === item.url ? "border-white" : "opacity-60",
              )}
              onClick={() => router.push(item.url)}
            >
              {item.icon}
              {item.label}
            </button>
          </div>
        ))}
      </div>
      <Line />
    </CardHeader>
  );
};

export { Header, ProfileNavigation, SavesHeader };
