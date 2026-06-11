const videoQualities = {
  "144p": { width: 256, height: 144 },
  "240p": { width: 426, height: 240 },
  "360p": { width: 640, height: 360 },
  "480p": { width: 854, height: 480 },
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
  "1440p": { width: 2560, height: 1440 },
  "2160p (4K)": { width: 3840, height: 2160 },
  "4320p (8K)": { width: 7680, height: 4320 },
} as const;

export { videoQualities };
