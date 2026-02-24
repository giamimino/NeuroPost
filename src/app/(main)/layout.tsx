"use client";
import CommentProvider from "@/components/common/CommentProvider";
import { useCommentsStore } from "@/store/zustand/commentsStore";
import { motion, useTransform } from "framer-motion";
import React from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { comment } = useCommentsStore();

  return (
    <div className="flex overflow-x-hidden">
      <motion.div
        className="min-w-0"
        animate={{ flexBasis: comment ? "66%" : "100%" }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        {children}
      </motion.div>
      <CommentProvider />
    </div>
  );
}
