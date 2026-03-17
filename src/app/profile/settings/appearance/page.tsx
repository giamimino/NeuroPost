"use client";
import { CardDescription, CardTitle } from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { useTheme } from "next-themes";
import React, { useState } from "react";

const themes = ["Light", "Dark"];

const SettingsAppearancePage = () => {
  const { theme, setTheme } = useTheme();
  const [curTheme, setCurTheme] = useState<any>(
    theme === "dark" ? "Dark" : "Light",
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      <CardTitle>Appearance</CardTitle>
      <div className="flex flex-col gap-2 w-full">
        <div className="flex gap-6 justify-between p-2 items-center">
          <CardDescription>Theme (Light / Dark)</CardDescription>
          <Combobox
            value={curTheme}
            onValueChange={(t) => {
              setTheme(t.toLowerCase());
              setCurTheme(t);
            }}
            items={themes}
          >
            <ComboboxInput placeholder="Select a Theme" />
            <ComboboxContent>
              <ComboboxEmpty>No items found.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>
    </div>
  );
};

export default SettingsAppearancePage;
