import { Icon } from "@iconify/react";
import React, { DetailedHTMLProps, InputHTMLAttributes } from "react";

const DefaultInput = ({
  icon,
  id,
  ...rest
}: DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & { icon?: string }) => {
  return (
    <div
      className={`flex py-2 border border-input-stroke 
        bg-secondary-bg rounded-md items-center 
        focus-within:border-foreground focus-within:ring-2 focus-within:ring-muted-foreground
        transition-all duration-300`}
    >
      {icon && (
        <label htmlFor={id}>
          <Icon icon={icon} className="text-foreground pl-2 text-2xl" />
        </label>
      )}
      <input
        className={`outline-none pl-2 placeholder:text-muted-foreground text-foreground`}
        {...rest}
      />
    </div>
  );
};

export default DefaultInput;
