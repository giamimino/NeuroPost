"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";
import { ApiConfig } from "@/configs/api-configs";

const Header = () => {
  const [show, setShow] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const router = useRouter();
  const pages = useRef<
    {
      url: string;
      label: string;
      type: "action" | "router";
      onClick?: () => void;
    }[]
  >([
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
  ]);

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
      <motion.nav
        initial={{ opacity: 0, y: "-100%" }}
        animate={show ? { opacity: 1, y: 0 } : { opacity: 0.5, y: "-150%" }}
        transition={{ stiffness: 80, type: "spring" }}
        layout
        className={`flex gap-4 items-center px-4 py-2.5 bg-secondary-bg border 
      border-input-stroke shadow-[0_5px_10px] shadow-white/10 rounded-full`}
      >
        {pages.current.map((page) => (
          <div
            onClick={
              page.type === "router"
                ? () => router.push(page.url)
                : page.type === "action" && page.onClick
                  ? page.onClick
                  : undefined
            }
            className={`${page.label === "Logout" ? "text-red-400" : "text-muted-foreground"} font-inter text-center font-medium 
              tracking-tight cursor-pointer px-2.5 py-1.5 hover:bg-active-bg ${page.label === "Logout" ? "hover:text-red-500" : "hover:text-foreground"} hover:tracking-wide 
              transition-all duration-300 rounded-xl hover:px-4`}
            key={page.url}
          >
            {page.label}
          </div>
        ))}
      </motion.nav>
    </header>
  );
};

export default Header;
