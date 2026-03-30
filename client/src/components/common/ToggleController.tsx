import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";
import React, { useState } from "react";

const ToggleController = ({
  whatToShow,
  children,
  className,
  animatePresence = false,
  defaultOpen = false,
}: {
  whatToShow: ({
    handleShow,
  }: {
    handleShow: React.Dispatch<React.SetStateAction<boolean>>;
  }) => React.ReactNode;
  children: ({
    setShow,
  }: {
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
  }) => React.ReactNode;
  className?: string;
  animatePresence?: boolean;
  defaultOpen?: boolean;
}) => {
  const [show, setShow] = useState(defaultOpen);

  return (
    <div className={cn("flex flex-col", className)}>
      {children({ setShow })}
      {animatePresence ? (
        <AnimatePresence>
          {show ? whatToShow({ handleShow: setShow }) : null}
        </AnimatePresence>
      ) : (
        show && whatToShow({ handleShow: setShow })
      )}
    </div>
  );
};

export default ToggleController;
