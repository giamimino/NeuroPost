import { videoQualities } from "@/constants/qualities";
import { Post } from "@/types/neon";
import Image from "next/image";
import React from "react";

const RenderPostMediaPreview = ({ media }: { media: Post["media"] }) => {
  if (!media) return null;

  const getMediaUrlFromPost = (media: NonNullable<Post["media"]>) => {
    if (media.type === "video" && media.thumb_url) {
      return media.thumb_url;
    } else if (media.type === "image") {
      return media.fileurl;
    }

    return null;
  };

  const fileUrl = getMediaUrlFromPost(media);

  if (!fileUrl) return null;

  return (
    <div>
      <Image
        src={fileUrl}
        alt={fileUrl}
        width={videoQualities["480p"].width}
        height={videoQualities["480p"].height}
      />
    </div>
  );
};

export default RenderPostMediaPreview;
