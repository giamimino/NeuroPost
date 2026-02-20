"use client";
import { useAlertStore } from "@/store/zustand/alertStore";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect } from "react";
import AlertContainer from "../common/AlertContainer";

const AlertsProvider = () => {
  const { alerts, removeAlert } = useAlertStore();
  const currentAlert = alerts[0] ?? null;

  useEffect(() => {
    if (!currentAlert) return;

    const timer = setTimeout(
      () => removeAlert(currentAlert.id),
      currentAlert.duration,
    );

    return () => clearTimeout(timer);
  }, [currentAlert]);

  return (
    <div className="fixed top-5 left-5 z-99">
      <AnimatePresence>
        {currentAlert && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ type: "spring", stiffness: 150, damping: 18 }}
          >
            <AlertContainer
              title={currentAlert.title}
              description={currentAlert.description ?? ""}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlertsProvider;
