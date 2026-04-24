import { Children, ClassName, ForyouPost } from "@/types/global";
import Line from "../ui/Line";
import React, { useState } from "react";
import { HandleLikeArgs } from "@/types/arguments";
import { Heart, MessageCircleMore } from "lucide-react";
import { handleLike } from "@/utils/functions/LikeActions";
import { useCommentsStore } from "@/store/zustand/commentsStore";
import { CardDescription, CardTitle } from "../ui/card";
import { PostContext, usePostContext } from "@/store/contexts/PostContext";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TagItem } from "../ui/tag";
import { Button } from "../ui/button";
import { PostContextType } from "@/types/context";
import Video from "./video";

interface GenericType extends Children, ClassName {}

const PostsContainer = ({ children }: Children) => {
  return (
    <section className="flex flex-col w-full items-center px-10 max-md:px-5 max-sm:px-2.5">
      {children}
    </section>
  );
};

const PostWrapper = ({
  children,
  initialPost,
}: Children & { initialPost: ForyouPost }) => {
  const [post, setPost] = useState<ForyouPost>(initialPost);
  const values = {
    post,
    onLike: (likeId) =>
      setPost((prev) => ({
        ...prev,
        like_id: likeId,
        likes: String(Number(prev.likes) + 1),
      })),
    onUnlike: () =>
      setPost((prev) => ({
        ...prev,
        like_id: null,
        likes: String(Number(prev.likes) - 1),
      })),
  } as PostContextType;

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

const PostActionsWrapper = ({ className, children }: GenericType) => {
  return (
    <div className={clsx("flex gap-3 items-center mt-3", className)}>
      {children}
    </div>
  );
};

PostActionsWrapper.displayName = "Post.ActionsWrapper";

const PostLike = () => {
  const { post, onLike, onUnlike } = usePostContext();
  const { likes, like_id, id } = post;

  return (
    <div className="flex justify-center items-center gap-1">
      <CardDescription>{likes}</CardDescription>
      <button
        className={`cursor-pointer w-fit`}
        onClick={async () => {
          const args: HandleLikeArgs = like_id
            ? { action: "delete", id: like_id }
            : {
                action: "post",
                postId: id,
              };
          const data = await handleLike(args);

          if (data.ok) {
            if (args.action === "delete") {
              onUnlike();
            } else if (args.action === "post" && data.like) {
              onLike(data.like);
            }
          }
        }}
      >
        <Heart
          width={18}
          height={18}
          className={`${like_id ? "text-red-600" : ""}`}
          {...(like_id ? { fill: "#ff0000" } : {})}
        />
      </button>
    </div>
  );
};

PostLike.displayName = "Post.Like";

const PostCommentBtn = () => {
  const { onOpen } = useCommentsStore();
  const { post } = usePostContext();

  return (
    <button className={`cursor-pointer w-fit`}>
      <MessageCircleMore
        width={18}
        height={18}
        onClick={() => onOpen(post.id)}
      />
    </button>
  );
};

PostCommentBtn.displayName = "Post.Comment";

const PostTags = ({ className }: ClassName) => {
  const { post } = usePostContext();
  const router = useRouter();

  if (!Array.isArray(post.tags)) return null;

  return (
    <div
      className={clsx(
        "flex gap-1.5 flex-wrap justify-center mt-2.5",
        className,
      )}
    >
      {Array.isArray(post.tags) &&
        post.tags.map((tag) => {
          if (tag.id === null || tag.tag === null) return null;
          return (
            <TagItem
              tag={`#${tag.tag}`}
              key={`${tag.id}-${post.id}`}
              variant="none"
              onClick={() => router.push(`/tags/${tag.tag}`)}
            />
          );
        })}
    </div>
  );
};

PostTags.displayName = "Post.Tags";

const ViewPost = ({ className }: ClassName) => {
  const { post } = usePostContext();
  const router = useRouter();

  return (
    <Button
      variant={"link"}
      className={clsx(
        "cursor-pointer p-0 text-muted-foreground hover:text-foreground",
        className,
      )}
      size={"sm"}
      onClick={() => router.push(`/post/${post.id}`)}
    >
      view post
    </Button>
  );
};

ViewPost.displayName = "Post.View";

type MediaProps = {
  src: string;
  alt?: string;
  className?: string;
};

const medias = {
  image: ({ src, alt, className }: MediaProps) => (
    <Image
      src={src}
      width={1080}
      height={720}
      alt={alt || ""}
      className={clsx("object-cover rounded-md mt-2 w-full", className)}
    />
  ),

  video: ({ src, className }: MediaProps) => (
    <Video
      src={src}
      loop
      playsInline
      autoPlayView
      className={clsx("rounded-xl w-full", className)}
    />
  ),
};

const PostMedia = ({ className }: ClassName) => {
  const { post } = usePostContext();

  if (!post.media || !post.media.url) return null;
  const MediaComponent = medias[post.media.type];

  return (
    <MediaComponent
      className={className}
      alt={post.title}
      src={post.media.url}
    />
  );
};

PostMedia.displayName = "Post.Media";

type PostCompound = React.FC<{
  children: React.ReactNode;
  className?: string;
  initialPost: ForyouPost;
}> & {
  Header: typeof PostHeader;
  Title: typeof PostTitle;
  Description: typeof PostDescription;
  Profile: typeof PostProfile;
  ProfileImage: typeof PostProfileImage;
  ProfileDescription: typeof PostProfileDescription;
  Card: typeof PostCard;
  Line: typeof PostLine;
  Tags: typeof PostTags;
  View: typeof ViewPost;
  ActionsWrapper: typeof PostActionsWrapper;
  Like: typeof PostLike;
  Comment: typeof PostCommentBtn;
  Media: typeof PostMedia;
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
  Tags: PostTags,
  View: ViewPost,
  ActionsWrapper: PostActionsWrapper,
  Like: PostLike,
  Comment: PostCommentBtn,
  Media: PostMedia,
}) as PostCompound;

export { PostWrapper, PostsContainer, Post };
