import { Children } from "@/types/global";
import Line from "../ui/Line";
import { useEffect, useRef, useState } from "react";
import { HandleLikeArgs } from "@/types/arguments";
import { Heart, MessageCircleMore } from "lucide-react";
import { handleLike } from "@/utils/functions/LikeActions";
import { useCommentsStore } from "@/store/zustand/commentsStore";
import { CardDescription } from "../ui/card";

const PostsContainer = ({ children }: Children) => {
  return <section className="flex flex-col w-full gap-2.5">{children}</section>;
};

const PostWrapper = ({ children }: Children) => {
  const [animate, setAnimate] = useState(false);
  const postRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);

          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    if (postRef.current) {
      observer.observe(postRef.current);
    }

    return () => {
      if (postRef.current) {
        observer.unobserve(postRef.current);
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div
      ref={postRef}
      className={`w-full flex flex-col items-center px-10 pt-2 opacity-0 ${animate ? "animate-fadeUpDown opacity-0" : ""}`}
    >
      <div className="py-10 px-40 w-5/7">{children}</div>
      <Line />
    </div>
  );
};

const PostActions = ({
  postId,
  likeId,
  onChange,
  likes
}: {
  postId: number;
  likeId: string | null;
  onChange: (args: HandleLikeArgs, data: any) => void;
  likes: number
}) => {
  const { onOpen } = useCommentsStore();
  return (
    <div className="flex gap-3 items-center mt-3">
      <div className="flex justify-center items-center gap-1">
        <CardDescription>
          {likes}
        </CardDescription>
        <button
          className={`cursor-pointer w-fit`}
          onClick={async () => {
            const args: HandleLikeArgs = likeId
              ? { action: "delete", id: likeId }
              : {
                  action: "post",
                  postId,
                };
            const data = await handleLike(args);
            if (data.ok) onChange(args, data);
          }}
        >
          <Heart
            width={18}
            height={18}
            className={`${likeId ? "text-red-600" : ""}`}
            {...(likeId ? { fill: "#ff0000" } : {})}
          />
        </button>
      </div>
      <button className={`cursor-pointer w-fit`}>
        <MessageCircleMore
          width={18}
          height={18}
          onClick={() => onOpen(postId)}
        />
      </button>
    </div>
  );
};

export { PostWrapper, PostsContainer, PostActions };
