import Image from "next/image";
import React from "react";

const AuthLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <div className="w-full">
      <div className="fixed top-0 left-0 -z-1 w-full h-screen">
        <Image
          src={"/Graphic.png"}
          width={1259}
          height={787}
          alt="bg"
          className="w-full h-full"
        />
      </div>
      {children}
    </div>
  );
};

export default AuthLayout;
