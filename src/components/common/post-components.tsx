import { Children } from "@/types/global";
import Line from "../ui/Line";
import { useEffect, useRef, useState } from "react";
import { HandleLikeArgs } from "@/types/arguments";
import { Heart } from "lucide-react";
import { ApiConfig } from "@/configs/api-configs";
import { apiFetch } from "@/lib/apiFetch";

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
}: {
  postId: number;
}) => {
  const handleLike = async (args: HandleLikeArgs) => {
    try {
      const res = await apiFetch("/api/post/like", {
        ...ApiConfig[args.action],
        body: JSON.stringify(
          args.action === "post"
            ? {
                postId: args.postId,
              }
            : { id: args.id },
        ),
      });
      const data = await res?.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center mt-3">
      <button
        className="cursor-pointer w-fit"
        onClick={() =>
          handleLike({
            action: "post",
            postId,
          })
        }
      >
        <Heart width={18} height={18} />
      </button>
    </div>
  );
};

export { PostWrapper, PostsContainer, PostActions };
