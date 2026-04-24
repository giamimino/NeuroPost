"use client";
import {
  Post,
  PostsContainer,
  PostWrapper,
} from "@/components/common/post-components";
import { TagItem } from "@/components/ui/tag";
import Title from "@/components/ui/title";
import { apiFetch } from "@/lib/apiFetch";
import { HandleLikeArgs } from "@/types/arguments";
import { ForyouPost, TagType } from "@/types/global";
import { MediaEnumType, UserJoin } from "@/types/neon";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Video from "@/components/common/video";

export default function Home() {
  const [posts, setPosts] = useState<ForyouPost[]>([]);
  const [took, setTook] = useState<number>(0);
  const tickingRef = useRef(false);
  const reachedRef = useRef(false);
  const latestPost = useRef<Date>(null);
  const router = useRouter();

  const fetchPosts = () => {
    if (tickingRef.current || reachedRef.current) return;
    const now = new Date().getTime();

    tickingRef.current = true;
    const url = `/api/post/foryou?limit=20&col=created_at&dir=DESC&withMedia=true&user=true&cursor=${latestPost.current || ""}`;
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
          <Post initialPost={post} key={post.id}>
            <Post.Card>
              <Post.Title />

              <Post.Description />

              <Post.Profile>
                <Post.ProfileImage />
                <Post.ProfileDescription />
              </Post.Profile>

              {post.media && (
                <div className="w-full mt-2.5">
                  <Post.Media />
                </div>
              )}

              <Post.Tags />

              <Post.ActionsWrapper>
                <Post.Like />
                <Post.Comment />
              </Post.ActionsWrapper>

              <Post.View />
            </Post.Card>
            <Post.Line />
          </Post>
        ))}
      </PostsContainer>
      <div className="fixed top-0 left-0 text-white z-99">
        {posts.length} / {took}ms
      </div>
    </motion.div>
  );
}
