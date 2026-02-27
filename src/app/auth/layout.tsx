import Image from "next/image";
import React from "react";

const AuthLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <div className="w-full h-screen relative">
      <div className="absolute top-0 left-0 -z-1 w-full h-full">
        <Image
          src={"/Graphic.png"}
          width={1259}
          height={787}
          alt="bg"
          className="w-full h-full"
        />
      </div>
      {/* <div className='w-full h-full'> */}
      {children}
      {/* </div> */}
    </div>
  );
};

export default AuthLayout;
