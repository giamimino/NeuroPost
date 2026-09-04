import { Header } from "@/components/header";
import AlertsProvider from "@/components/providers/AlertsProvider";
import ProfileStatusProvider from "@/components/providers/Profile_status.provider";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ScrollContextProvider } from "@/store/contexts/ScrollContext";
import { Analytics } from "@vercel/analytics/next";
import React from "react";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Analytics />
      <ThemeProvider attribute={"class"} defaultTheme="system" enableSystem>
        <ScrollContextProvider>
          <ReactQueryProvider>
            <Header />
            <AlertsProvider />
            <ProfileStatusProvider />
            {children}
            <div className="h-10"></div>
          </ReactQueryProvider>
        </ScrollContextProvider>
      </ThemeProvider>
    </div>
  );
};

export default Providers;
