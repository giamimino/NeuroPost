import { Children } from "@/types/global";
import React, { useEffect, useRef, useState } from "react";

const InViewport = ({
  children,
}: Children & { animate?: boolean }) => {
  const [show, setShow] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);

          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }

    return () => {
      if (wrapperRef.current) {
        observer.unobserve(wrapperRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{minHeight: "100px"}}
    >
      {show && children}
    </div>
  );
};

export default InViewport;
