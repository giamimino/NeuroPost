import { Children, ClassName, ForyouPost } from "@/types/global";
import Line from "../ui/Line";
import React, { useEffect, useRef, useState } from "react";
import { HandleLikeArgs } from "@/types/arguments";
import { Heart, MessageCircleMore } from "lucide-react";
import { handleLike } from "@/utils/functions/LikeActions";
import { useCommentsStore } from "@/store/zustand/commentsStore";
import { CardDescription, CardTitle } from "../ui/card";
import { PostContext, usePostContext } from "@/store/contexts/PostContext";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface GenericType extends Children, ClassName {}

const PostsContainer = ({ children }: Children) => {
  return (
    <section className="flex flex-col w-full items-center px-10 max-md:px-5 max-sm:px-2.5">{children}</section>
  );
};

const PostWrapper = ({ children, post }: Children & { post: ForyouPost }) => {
  const values = {
    post,
  };

  return <PostContext.Provider value={values}>{children}</PostContext.Provider>;
};

const PostHeader = ({ children, className }: GenericType) => {
  return <div className={clsx("flex flex-col", className)}>{children}</div>;
};

PostHeader.displayName = "Post.Header";

const PostTitle = ({ className }: ClassName) => {
  const { post } = usePostContext();

  return <CardTitle className={className}>{post.title}</CardTitle>;
};

PostTitle.displayName = "Post.Title";

const PostDescription = ({ className }: ClassName) => {
  const { post } = usePostContext();

  return (
    <p
      className={clsx(
        "text-muted-foreground w-full max-w-50 line-clamp-4",
        className,
      )}
    >
      {post.description}
    </p>
  );
};

PostDescription.displayName = "Post.Description";

const PostProfile = ({ children, className }: GenericType) => {
  return (
    <div className={clsx("flex gap-2.5 items-center", className)}>
      {children}
    </div>
  );
};

PostProfile.displayName = "Post.Profile";

const PostProfileImage = ({ className }: ClassName) => {
  const { post } = usePostContext();
  return (
    <Image
      src={post.user.profile_url}
      width={36}
      height={36}
      alt={`${post.user.name}-user-profile`}
      className={clsx("object-cover rounded-full mt-2 w-8 h-8", className)}
    />
  );
};

PostProfileImage.displayName = "Post.ProfileImage";

const PostProfileDescription = ({ className }: ClassName) => {
  const { post } = usePostContext();
  const router = useRouter();

  return (
    <CardDescription
      className={clsx("cursor-pointer", className)}
      onClick={() => router.push(`/u/${post.user.username}`)}
    >
      {post.user.name}
    </CardDescription>
  );
};

PostProfileDescription.displayName = "Post.ProfileDescription";

const PostCard = ({ className, children }: GenericType) => {
  return (
    <div
      className={clsx(
        `font-plusJakartaSans text-start 
        flex flex-col items-start border 
        border-card-border p-5 rounded-lg w-full max-w-125`,
        className,
      )}
    >
      {children}
    </div>
  );
};

PostCard.displayName = "Post.Card";

const PostLine = () => {
  return (
    <div className="w-full max-md:my-7.5 max-sm:my-5 my-10">
      <Line className="mb-0 opacity-50" />
    </div>
  );
};

PostLine.displayName = "Post.Line";

const PostActions = ({
  postId,
  likeId,
  onChange,
  likes,
}: {
  postId: number;
  likeId: string | null;
  onChange: (args: HandleLikeArgs, data: any) => void;
  likes: string;
}) => {
  const { onOpen } = useCommentsStore();
  return (
    <div className="flex gap-3 items-center mt-3">
      <div className="flex justify-center items-center gap-1">
        <CardDescription>{likes}</CardDescription>
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

type PostCompound = React.FC<{
  children: React.ReactNode;
  className?: string;
  post: ForyouPost;
}> & {
  Header: typeof PostHeader;
  Title: typeof PostTitle;
  Description: typeof PostDescription;
  Profile: typeof PostProfile;
  ProfileImage: typeof PostProfileImage;
  ProfileDescription: typeof PostProfileDescription;
  Card: typeof PostCard;
  Line: typeof PostLine;
};

const Post = Object.assign(PostWrapper, {
  Header: PostHeader,
  Title: PostTitle,
  Description: PostDescription,
  Profile: PostProfile,
  ProfileImage: PostProfileImage,
  ProfileDescription: PostProfileDescription,
  Card: PostCard,
  Line: PostLine,
}) as PostCompound;

export { PostWrapper, PostsContainer, PostActions, Post };
