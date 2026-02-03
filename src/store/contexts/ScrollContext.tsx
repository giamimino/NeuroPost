"use client";

import { Children } from "@/types/global";
import { useContext, useEffect, useState, createContext } from "react";
import Lenis from "lenis";

const SmoothScrollerContext = createContext<Lenis | null>(null);

export const useSmoothScroller = () => useContext(SmoothScrollerContext);

export const ScrollContextProvider = ({ children }: Children) => {
  const [lenisRef, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const scroller = new Lenis();

    const raf = (time: number) => {
      scroller.raf(time);
      requestAnimationFrame(raf);
    };

    const rf = requestAnimationFrame(raf);

    setLenis(scroller);

    return () => {
      cancelAnimationFrame(rf);
      scroller.destroy();
    };
  }, []);

  return (
    <SmoothScrollerContext.Provider value={lenisRef}>
      {children}
    </SmoothScrollerContext.Provider>
  );
};
