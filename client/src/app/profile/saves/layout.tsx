"use client";
import { SavesHeader } from "@/components/header";
import { Card } from "@/components/ui/card";
import { Children } from "@/types/global";
import React from "react";

export default function SavesLayout({ children }: Children) {
  return (
    <div className="mt-20 px-5">
      <Card className="px-0 py-3">
        <SavesHeader />
        {children}
      </Card>
    </div>
  );
}
