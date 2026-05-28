import { Icon } from "@iconify/react";
import { InputHTMLAttributes, useId, useRef, useState } from "react";
import { Button } from "../ui/button";

export default function PasswordInput({
  name,
  autoComplete,
}: {
  name?: string;
  autoComplete?: InputHTMLAttributes<HTMLInputElement>["autoComplete"];
}) {
  const [visible, setVisible] = useState(false);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleVisibility = () => {
    if (!inputRef.current) return;

    setVisible((prev) => !prev);
    inputRef.current.focus();
  };

  return (
    <div
      className={`flex py-2 border border-input-stroke 
            bg-secondary-bg rounded-md items-center 
            focus-within:border-foreground focus-within:ring-2 focus-within:ring-muted-foreground
            transition-all duration-300`}
    >
      <label htmlFor={inputId}>
        <Icon icon={"gg:lock"} className="text-foreground pl-2 text-2xl" />
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type={visible ? "text" : "password"}
        name={name || "current-password"}
        autoComplete={autoComplete || "current-password"}
        placeholder="Password"
        className={`outline-none pl-2 placeholder:text-muted-foreground text-foreground`}
      />
      <Button
        type="button"
        size={"icon-xs"}
        variant={"outline"}
        className="p-2 mx-2 cursor-pointer"
        onClick={handleVisibility}
      >
        <Icon
          icon={visible ? "formkit:eye" : "formkit:eyeclosed"}
          className="text-foreground text-2xl"
        />
      </Button>
    </div>
  );
}
