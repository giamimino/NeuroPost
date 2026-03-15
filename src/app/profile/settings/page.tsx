import { Card, CardFooter, CardTitle } from "@/components/ui/card";
import React from "react";

// const pages = [{ label: "" }];

const SettingsPage = () => {
  return (
    <div className="pt-20 px-5">
      <Card className="h-full p-0">
        <div className="flex">
          <CardFooter className="border-r py-4 px-0 flex flex-col">
            <CardTitle className="text-xl border-b px-4 pb-4">
              settings
            </CardTitle>
            <div className="px-4"></div>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
