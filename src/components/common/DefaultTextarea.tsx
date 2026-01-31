import React, { DetailedHTMLProps, TextareaHTMLAttributes } from "react";

const DefaultTextarea = ({
  ...rest
}: DetailedHTMLProps<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
>) => {
  return (
    <textarea
      className={`flex p-2 border border-input-stroke 
        bg-secondary-bg rounded-md items-center 
        focus-within:border-foreground focus-within:ring-2 focus-within:ring-muted-foreground
        transition-all duration-300 text-foreground min-h-40`}
        {...rest}
    />
  );
};

export default DefaultTextarea;
