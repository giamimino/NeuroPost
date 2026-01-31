"use client";
import {
  PostsContainer,
  PostWrapper,
} from "@/components/common/post-components";
import Title from "@/components/ui/title";
import { apiFetch } from "@/lib/apiFetch";
import { Post } from "@/types/neon";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [took, setTook] = useState<number>(0)
  const tickingRef = useRef(false);
  const reachedRef = useRef(false);
  const latestPost = useRef<Date>(undefined);

  const fetchPosts = () => {
    if (tickingRef.current || reachedRef.current) return;
    const now = new Date().getTime()

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
        setTook(new Date().getTime() - now)
      });
  };

  useEffect(() => {
    fetchPosts()
  }, []);

  useEffect(() => {
    latestPost.current = posts.findLast(p => p.created_at)?.created_at
  }, [posts])

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const scrollClient = document.documentElement.clientHeight
      const target = 0.85

      if(scrollTop + scrollClient >= scrollHeight * target) {
        fetchPosts()
      }
    }

    window.addEventListener("scroll", onScroll)

    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="w-full pt-32">
      <PostsContainer>
        {posts.map((post) => (
            <PostWrapper
            key={`a_${post.author_id}_pd_${post.id}_postwrapper-${post.created_at}`}
            >
              <div className="font-plusJakartaSans text-center flex flex-col items-center gap-3">
                <Title title={post.title} />
                <img
                  src={
                    "https://i.pinimg.com/736x/32/e1/fb/32e1fb59b631107f6f45307ccab219dc.jpg"
                  }
                  alt="bg"
                  className="w-2/5 rounded-xl"
                />
                <p className="text-muted-foreground max-w-3/5">
                  {post.description}
                </p>
              </div>
            </PostWrapper>
        ))}
      </PostsContainer>
      <div className="fixed top-0 left-0 text-white z-99">{posts.length} / {took}ms</div>
    </div>
  );
}
