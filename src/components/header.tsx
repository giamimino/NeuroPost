"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";
import { ApiConfig } from "@/configs/api-configs";
import { Button } from "./ui/button";
import { Menu, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Card, CardHeader, CardTitle } from "./ui/card";

const Header = () => {
  const [show, setShow] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const router = useRouter();
  const pages = [
    { label: "Home", url: "/", type: "router" },
    { label: "Profile", url: "/profile", type: "router" },
    { label: "Upload", url: "/profile/p/create", type: "router" },
    {
      label: "Logout",
      url: "/auth/login",
      type: "action",
      onClick: async () => {
        const url = "/api/auth/logout";
        const res = await apiFetch(url, ApiConfig.post);
        const data = await res?.json();
        if (data.ok) {
          router.push("/");
        }
        console.log(data);
      },
    },
  ];

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
      className={`w-full px-12 flex justify-center items-center py-3 fixed top-0 left-0 z-99 transition-all duration-300`}
    >
      <motion.div
        initial={{ opacity: 0, y: "-100%" }}
        animate={show ? { opacity: 1, y: 0 } : { opacity: 0.5, y: "-150%" }}
        transition={{ stiffness: 80, type: "spring" }}
        layout
        className={`flex gap-4 items-center px-4 py-2.5 dark:bg-card
       rounded-full border-input ring ring-ring/80`}
      >
        {pages.map((page) => (
          <div
            onClick={
              page.type === "router"
                ? () => router.push(page.url)
                : page.type === "action" && page.onClick
                  ? page.onClick
                  : undefined
            }
            className={`${page.label === "Logout" ? "text-red-400" : "text-muted-foreground"} font-inter text-center font-medium 
              tracking-tight cursor-pointer px-2.5 py-1.5 hover:bg-active-bg ${page.label === "Logout" ? "hover:text-red-500" : "hover:text-white"} hover:tracking-wide 
              transition-all duration-300 rounded-xl hover:px-4`}
            key={page.url}
          >
            {page.label}
          </div>
        ))}
      </motion.div>

      <div className="absolute right-5 top-5 max-xs:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"outline"} className="cursor-pointer">
              <Search />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="left"
            align="start"
            sideOffset={4}
            className="max-h-60 overflow-y-auto"
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
      </div>
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
  { url: "saves", label: "Saves", variant: "ghost" },
  { url: "edit", label: "Edit", variant: "ghost" },
  { url: "friends", label: "Friends", variant: "ghost" },
  { url: "settings", label: "Settings", variant: "ghost" },
];

const ProfileNavigation = () => {
  const [show, setShow] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-2.5">
      <div className="hidden max-xs:block">
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
        animate={show ? { opacity: 100, y: 0 } : { opacity: 100, y: "-200%" }}
        transition={{
          type: "spring",
          stiffness: 80,
          damping: 20,
        }}
        initial={{ opacity: 0, z: -10 }}
        className="pr-4"
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
                  onClick={() => router.push(`/profile/${page.url}`)}
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

export { Header, ProfileNavigation };
