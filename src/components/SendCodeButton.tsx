import React, { useState } from "react";
import { Button } from "./ui/button";
import { ERRORS } from "@/constants/error-handling";
import { useAlertStore } from "@/store/zustand/alertStore";
import { Spinner } from "./ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Check } from "lucide-react";

type status = "check" | "idle" | "loading" | "success" | "error";
type Variant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "none"
  | "disabled";
type Size =
  | "default"
  | "xs"
  | "md"
  | "sm"
  | "lg"
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-lg";

interface SendCodeButtonProps {
  handleSend: () => Promise<
    | {
        data: any;
        error?: { title: string; description: string };
      }
    | { data?: any; error: { title: string; description: string } }
  >;
  handleCheck: () => Promise<
    | {
        data: any;
        error?: { title: string; description: string };
      }
    | { data?: any; error: { title: string; description: string } }
  >;
  variant?: Variant;
  size?: Size;
  className?: string;
  onSuccess: () => void;
}

export default function SendCodeButton({
  handleSend,
  handleCheck,
  variant,
  size,
  className,
  onSuccess,
}: SendCodeButtonProps) {
  const [status, setStatus] = useState<status>("idle");
  const { addAlert } = useAlertStore();
  const handleSendClick = async () => {
    setStatus("loading");
    try {
      const { data, error } = await handleSend();
      if (data.ok) {
        setStatus("check");
      } else if (error) {
        addAlert({ id: crypto.randomUUID(), type: "error", ...error });
      }
    } catch {
      setStatus("idle");
      addAlert({
        id: crypto.randomUUID(),
        type: "error",
        ...ERRORS.GENERIC_ERROR,
      });
    }
  };

  console.log(status);
  const handleCheckClick = async () => {
    setStatus("loading");
    try {
      const { data, error } = await handleCheck();
      if (data?.ok) {
        setStatus("success");
        onSuccess();
      } else if (error) {
        addAlert({ id: crypto.randomUUID(), type: "error", ...error });
        setStatus("check");
      }
    } catch (error) {
      console.error(error);

      addAlert({
        id: crypto.randomUUID(),
        type: "error",
        ...ERRORS.GENERIC_ERROR,
      });
    }
  };

  return (
    <Button
      onClick={
        status === "idle"
          ? handleSendClick
          : status === "check"
            ? handleCheckClick
            : undefined
      }
      variant={status === "loading" ? "disabled" : variant}
      size={size}
      className={clsx("relative w-28", className)}
    >
      <AnimatePresence mode="wait">
        {status === "loading" ? (
          <motion.div
            key={"loading"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex gap-2 items-center"
          >
            <Spinner />
            <p>loading...</p>
          </motion.div>
        ) : status === "check" ? (
          <motion.div
            key={"check"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex gap-2 items-center"
          >
            <p>check</p>
          </motion.div>
        ) : status === "success" ? (
          <motion.div
            key={"success"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex gap-2 items-center"
          >
            <Check />
          </motion.div>
        ) : (
          <motion.div
            key={"idle"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex gap-2 items-center"
          >
            <p>Send Code</p>
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
