import clsx from "clsx";
import { Pause } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

export default function Video({
  src,
  poster,
  className,
  autoPlayView = false,
  ...rest
}: React.VideoHTMLAttributes<HTMLVideoElement> & {
  poster?: string;
  autoPlayView?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  const handlePause = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setPaused(false);
    } else {
      videoRef.current.pause();
      setPaused(true);
    }
  };

  const handleSafePlay = () => {
    setPaused(false);
    videoRef.current?.play().catch(() => {});
  };

  useEffect(() => {
    if (!autoPlayView) return;

    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!video) return;
        if (entry.isIntersecting) {
          handleSafePlay();
        } else {
          video.pause();
        }
      },
      { threshold: 1, rootMargin: "-10% 0px" },
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [autoPlayView]);

  return (
    <div className="relative" onClick={handlePause}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        className={clsx("w-full", className)}
        {...rest}
      ></video>
      <AnimatePresence>
        {paused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 -translate-1/2 mix-blend-difference text-white max-md:scale-75 cursor-pointer"
          >
            <Pause width={64} height={64} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
