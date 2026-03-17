import { ToggleContext, useToggle } from "@/store/contexts/ToggleContext";
import clsx from "clsx";
import React, { createContext, useState } from "react";

const variants = {
  default: "",
};

const ToggleSwitch = ({
  className,
  children,
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
}: {
  className?: string;
  children: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (value: boolean) => void;
}) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);

  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;

  const toggle = () => {
    const newValue = !checked;

    if (!controlledChecked) {
      setInternalChecked(newValue);
    }

    onChange?.(newValue);
  };
  return (
    <ToggleContext.Provider value={{ checked, toggle }}>
      <div className={clsx("relative inline-flex", className)}>{children}</div>
    </ToggleContext.Provider>
  );
};

const ToggleTrack = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const { toggle, checked } = useToggle();

  return (
    <div
      onClick={toggle}
      className={clsx(
        "w-8 h-4 rounded-full border border-border transition duration-300",
        checked ? "bg-accent-foreground" : "bg-accent",
        className,
      )}
    >
      {children}
    </div>
  );
};

ToggleTrack.displayName = "ToggleSwitch.Track";

const ToggleThumb = ({ className }: { className?: string }) => {
  const { checked } = useToggle();
  return (
    <span
      className={clsx(
        `absolute w-2.5 h-2.5 rounded-full top-1/2 left-0.5 -translate-y-1/2 cursor-pointer transition duration-300`,
        checked
          ? "bg-accent translate-x-4.5"
          : "bg-accent-foreground translate-x-0",
        className,
      )}
    ></span>
  );
};
ToggleThumb.displayName = "ToggleSwitch.Thumb";

ToggleSwitch.Track = ToggleTrack;
ToggleSwitch.Thumb = ToggleThumb;

export { ToggleSwitch };
