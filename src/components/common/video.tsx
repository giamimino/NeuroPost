import clsx from "clsx";
import { Pause } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useRef, useState } from "react";

export default function Video({
  src,
  poster,
  className,
  ...rest
}: React.VideoHTMLAttributes<HTMLVideoElement> & {
  poster?: string;
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

  return (
    <div className="relative" onClick={handlePause}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        controls
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
