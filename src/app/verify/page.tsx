import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import React from "react";

const VerifyPage = () => {
  return (
    <div className="pt-20 flex justify-center">
      <div className="flex flex-col items-center gap-3 text-center ">
        <CardTitle className="text-xl">
          Verify your email to activate your account
        </CardTitle>

        <p className="text-sm text-muted-foreground">
          We’ll send a verification link to your email address.
        </p>

        <Button variant={"outline"} className="cursor-pointer">
          Send verification email
        </Button>
      </div>
    </div>
  );
};

export default VerifyPage;
