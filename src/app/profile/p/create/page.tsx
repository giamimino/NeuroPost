"use client";
import DefaultInput from "@/components/common/DefaultInput";
import DefaultTextarea from "@/components/common/DefaultTextarea";
import Title from "@/components/ui/title";
import { ApiConfig } from "@/configs/api-configs";
import { apiFetch } from "@/lib/apiFetch";
import { Flamenco } from "next/font/google";
import React, { useState } from "react";

const PostUploadPage = () => {
  const [loading, setLoading] = useState(false);
  const handleUploadPost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
      console.log("call");
      
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | undefined;
    const url = "/api/post";
    
    if (!title.trim() || (description && !description.trim())) return;
    
    setLoading(true);
    apiFetch(url, {
      ...ApiConfig.post,
      body: JSON.stringify({ title, description }),
    })
      .then((res) => res?.json())
      .then((data) => {
        setLoading(false);
        console.log(data);
        form.reset();
      });
  };
  return (
    <div>
      <div className="flex justify-center w-full mt-35">
        <form onSubmit={handleUploadPost} className="flex flex-col gap-4.5">
          <div className="text-center">
            <Title title="Upload a post..." font="--font-plusJakartaSans" />
          </div>
          <DefaultInput name="title" placeholder="title" />
          <DefaultTextarea
            name="description"
            placeholder="description"
            cols={8}
          />
          <button type="button" className="text-muted-foreground w-full p-2.5 flex justify-center border border-active-bg rounded-lg cursor-pointer">
            upload a picture
          </button>
          <button
            type="submit"
            className="rounded-md bg-foreground text-secondary-bg py-3 cursor-pointer font-plusJakartaSans font-semibold text-lg tracking-tight hover:bg-foreground/60"
          >
            submit
          </button>
          {loading && (
            <div className="text-center">
              <Title title="loading..." text="--text-base" />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PostUploadPage;
