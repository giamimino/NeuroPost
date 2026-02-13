"use client";
import DefaultInput from "@/components/common/DefaultInput";
import DefaultTextarea from "@/components/common/DefaultTextarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Line from "@/components/ui/Line";
import { ApiConfig } from "@/configs/api-configs";
import { apiFetch } from "@/lib/apiFetch";
import { User } from "@/types/neon";
import React, { Ref, useEffect, useMemo, useRef, useState } from "react";

const ProfileEditPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const username = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const name = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const bio = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const fields = useMemo(
    () => [
      {
        label: "Username",
        name: "username",
        description:
          "Usernames can only contain letters, numbers, underscores, and periods. Changing your username will also change your profile link.",
        ref: username,
        type: "input",
      },
      {
        label: "Name",
        name: "name",
        description: null,
        ref: name,
        type: "input",
      },
      {
        label: "Bio",
        name: "bio",
        description: null,
        ref: bio,
        type: "textarea",
      },
    ],
    [],
  );
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    apiFetch("/api/user", { ...ApiConfig.get, signal })
      .then((res) => res?.json())
      .then((data) => {
        if (data.ok) {
          const u = { id: data.user.payload.userId, ...data.user.user } as User;
          setUser(u);
          if (!username.current || !name.current || !bio.current) return;

          username.current.value = u.username;
          name.current.value = u.name;
          bio.current.value = u.bio || "";
        }
      });

    return () => controller.abort();
  }, []);
  return (
    <div className="pt-20 px-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <div>
              <CardTitle>Profile photo</CardTitle>
            </div>
            <Line className="mt-5" />
          </div>
          {fields.map((f) => (
            <div key={`${f.name}`}>
              <div className="flex">
                <CardTitle className="sm:w-25 lg:w-1/5">{f.label}</CardTitle>
                <div className="max-w-61">
                  {f.type === "input" ? (
                    <Input ref={f.ref as React.RefObject<HTMLInputElement>} className="w-fit" />
                  ) : (
                    <DefaultTextarea ref={f.ref as React.RefObject<HTMLTextAreaElement>} className="w-61" />
                  )}
                  {f.description && (
                    <CardDescription>{f.description}</CardDescription>
                  )}
                </div>
              </div>
              <Line className="my-5" />
            </div>
          ))}
        </CardContent>
        <CardFooter className="justify-end">
          <div className="flex gap-3 font-plusJakartaSans">
            <Button variant={"secondary"} className="cursor-pointer">
              Cancel
            </Button>
            <Button variant={"disabled"} className="">
              Save
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfileEditPage;
