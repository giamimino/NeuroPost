import React, { useState } from "react";
import { Button } from "./ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Spinner } from "./ui/spinner";
import { useAlertStore } from "@/store/zustand/alertStore";
import { ERRORS } from "@/constants/error-handling";
import { Check } from "lucide-react";

type status = "idle" | "loading" | "success" | "error";
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

const DefaultLoading = () => {
  return (
    <div className="flex gap-2">
      <Spinner />
      <p>loading...</p>
    </div>
  );
};

interface ActionButtonProps {
  onAction: () => Promise<
    | {
        data: any;
        error?: { title: string; description: string };
      }
    | { data?: any; error: { title: string; description: string } }
  >;
  variant?: Variant;
  size?: Size;
  className?: string;
  onSuccess?: (data: any) => void;
  children: React.ReactNode;
  loadingUI?: React.ReactNode;
  successUI?: React.ReactNode;
}

export default function ActionButton({
  className,
  onAction,
  variant,
  size,
  children,
  onSuccess,
  loadingUI = <DefaultLoading />,
  successUI = <Check />,
}: ActionButtonProps) {
  const [status, setStatus] = useState<status>("idle");
  const { addAlert } = useAlertStore();

  const onClick = async () => {
    setStatus("loading");
    try {
      const { data, error } = await onAction();
      if (data.ok) {
        setStatus("success");
        onSuccess?.(data);
      } else if (error) {
        setStatus("idle");
        addAlert({ id: crypto.randomUUID(), type: "error", ...error });
      }
    } catch {
      setStatus("error");
      addAlert({
        id: crypto.randomUUID(),
        type: "error",
        ...ERRORS.GENERIC_ERROR,
      });
    }
  };

  return (
    <Button
      onClick={status === "idle" || status === "error" ? onClick : undefined}
      variant={variant}
      size={size}
      className={className}
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
            {loadingUI}
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
            {successUI}
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
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
