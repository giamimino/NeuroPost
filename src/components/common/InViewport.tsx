import { Children } from "@/types/global";
import React, { useEffect, useRef, useState } from "react";

const InViewport = ({ children }: Children & { animate?: boolean }) => {
  const [show, setShow] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapperElement = wrapperRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);

          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    if (wrapperElement) {
      observer.observe(wrapperElement);
    }

    return () => {
      if (wrapperElement) {
        observer.unobserve(wrapperElement);
      }
    };
  }, []);

  return (
    <div ref={wrapperRef} style={{ minHeight: "100px" }}>
      {show && children}
    </div>
  );
};

export default InViewport;
