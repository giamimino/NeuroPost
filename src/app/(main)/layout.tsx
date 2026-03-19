"use client";
import CommentProvider from "@/components/common/CommentProvider";
import { useCommentsStore } from "@/store/zustand/commentsStore";
import { motion } from "framer-motion";
import React from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { comment } = useCommentsStore();

  const responsive =
    window.innerWidth < 640 ? "100%" : window.innerWidth < 768 ? "45%" : "66%";

  return (
    <div className="flex">
      <motion.div
        className="min-w-0"
        animate={{ flexBasis: comment ? responsive : "100%" }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        {children}
      </motion.div>
      <CommentProvider />
    </div>
  );
}
