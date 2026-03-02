import { Card, CardHeader } from "@/components/ui/card";
import React from "react";
import { motion } from "framer-motion";

const NotificationsContainer = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0}}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
    >
      <Card className="min-w-100">
        <CardHeader>

        </CardHeader>
      </Card>
    </motion.div>
  );
};

export default NotificationsContainer;
