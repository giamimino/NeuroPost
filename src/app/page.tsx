"use client";
import {
  PostActions,
  PostsContainer,
  PostWrapper,
} from "@/components/common/post-components";
import Title from "@/components/ui/title";
import { ApiConfig } from "@/configs/api-configs";
import { apiFetch } from "@/lib/apiFetch";
import { HandleLikeArgs } from "@/types/arguments";
import { Post } from "@/types/neon";
import { Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [took, setTook] = useState<number>(0);
  const tickingRef = useRef(false);
  const reachedRef = useRef(false);
  const latestPost = useRef<Date>(undefined);

  const fetchPosts = () => {
    if (tickingRef.current || reachedRef.current) return;
    const now = new Date().getTime();

    tickingRef.current = true;
    const url = `/api/post?limit=4&col=created_at&dir=DESC&cursor=${latestPost.current || ""}`;
    apiFetch(url)
      .then((res) => res?.json())
      .then((data) => {
        if (data.ok) {
          setPosts((prev) => [...prev, ...data.posts]);

          if (data.posts.length <= 3) {
            reachedRef.current = true;
            console.log(reachedRef.current);
          }
        }
        tickingRef.current = false;
        setTook(new Date().getTime() - now);
      });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    latestPost.current = posts.findLast((p) => p.created_at)?.created_at;
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
    <div className="w-full pt-32">
      <PostsContainer>
        {posts.map((post) => (
          <PostWrapper
            key={`a_${post.author_id}_pd_${post.id}_postwrapper-${post.created_at}`}
          >
            <div className="w-full flex justify-center">
              <div className="font-plusJakartaSans text-center flex flex-col items-center border border-card-border p-5 rounded-lg">
                <Title title={post.title} />
                {post.image && (
                  <img src={post.image} alt="bg" className="w-2/5 rounded-xl" />
                )}
                <p className="text-muted-foreground max-w-3/5">
                  {post.description}
                </p>
                <PostActions userId={post.author_id} postId={post.id}  />
              </div>
            </div>
          </PostWrapper>
        ))}
      </PostsContainer>
      <div className="fixed top-0 left-0 text-white z-99">
        {posts.length} / {took}ms
      </div>
    </div>
  );
}
