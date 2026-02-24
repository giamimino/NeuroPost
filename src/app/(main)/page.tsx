"use client";
import {
  PostActions,
  PostsContainer,
  PostWrapper,
} from "@/components/common/post-components";
import { TagItem } from "@/components/ui/tag";
import Title from "@/components/ui/title";
import { apiFetch } from "@/lib/apiFetch";
import { HandleLikeArgs } from "@/types/arguments";
import { TagType } from "@/types/global";
import { Post } from "@/types/neon";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [posts, setPosts] = useState<
    (Post & { tags: TagType[]; like_id: string | null })[]
  >([]);
  const [took, setTook] = useState<number>(0);
  const tickingRef = useRef(false);
  const reachedRef = useRef(false);
  const latestPost = useRef<Date>(null);
  const router = useRouter();

  const fetchPosts = () => {
    if (tickingRef.current || reachedRef.current) return;
    const now = new Date().getTime();

    tickingRef.current = true;
    const url = `/api/post/foryou?limit=10&col=created_at&dir=DESC&cursor=${latestPost.current || ""}`;
    apiFetch(url)
      .then((res) => res?.json())
      .then((data) => {
        if (data.ok) {
          setPosts((prev) => [...prev, ...data.posts]);

          if (data.posts.length < 10) reachedRef.current = true;
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        tickingRef.current = false;
        setTook(new Date().getTime() - now);
      });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    latestPost.current = posts.length
      ? posts[posts.length - 1].created_at
      : null;
  }, [posts]);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollClient = document.documentElement.clientHeight;
      const target = 0.85;

      if (scrollTop + scrollClient >= scrollHeight * target) {
        fetchPosts();
      }
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.div className="w-full flex pt-20 transition duration-300">
      <PostsContainer>
        {posts.map((post) => (
          <PostWrapper
            key={`a_${post.author_id}_pd_${post.id}_postwrapper-${post.created_at}`}
          >
            <div className="w-full flex justify-center">
              <div className="font-plusJakartaSans text-center flex flex-col items-center border border-card-border p-5 rounded-lg">
                <Title title={post.title} />
                <p className="text-muted-foreground max-w-3/5">
                  {post.description}
                </p>
                <div className="flex gap-1.5 flex-wrap w-1/2 justify-center mt-5">
                  {post.tags.map((tag) => {
                    if (tag.id === null || tag.tag === null) return null;
                    return (
                      <TagItem
                        tag={`#${tag.tag}`}
                        key={`${tag.id}-${tag.tag}-${post.id}`}
                        variant="none"
                        onClick={() => router.push(`/tags/${tag.tag}`)}
                      />
                    );
                  })}
                </div>
                <PostActions
                  onChange={(args: HandleLikeArgs, data) => {
                    if (args.action === "delete" && data.ok) {
                      setPosts((prev) =>
                        prev.map((p) =>
                          p.id === post.id ? { ...p, like_id: null } : p,
                        ),
                      );
                    } else if (args.action === "post" && data.ok) {
                      setPosts((prev) =>
                        prev.map((p) =>
                          p.id === post.id ? { ...p, like_id: data.like } : p,
                        ),
                      );
                    }
                  }}
                  likeId={post.like_id}
                  postId={post.id}
                />
              </div>
            </div>
          </PostWrapper>
        ))}
      </PostsContainer>
      <div className="fixed top-0 left-0 text-white z-99">
        {posts.length} / {took}ms
      </div>
    </motion.div>
  );
}
