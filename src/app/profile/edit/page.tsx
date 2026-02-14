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
import { UsernameRefference } from "@/constants/refference";
import { apiFetch } from "@/lib/apiFetch";
import { User } from "@/types/neon";
import React, { Ref, useEffect, useMemo, useRef, useState } from "react";

const ProfileEditPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [changed, setChanged] = useState(false);

  const fields = [
    {
      label: "Username",
      name: "username",
      description: UsernameRefference,
      type: "input",
      state: username,
      setState: setUsername,
    },
    {
      label: "Name",
      name: "name",
      description: null,
      type: "input",
      state: name,
      setState: setName,
    },
    {
      label: "Bio",
      name: "bio",
      description: null,
      type: "textarea",
      state: bio,
      setState: setBio,
    },
  ];

  useEffect(() => {
    apiFetch("/api/user")
      .then((res) => res?.json())
      .then((data) => {
        if (data.ok) {
          const u = { id: data.user.payload.userId, ...data.user.user } as User;
          setUser(u);

          setUsername(u.username);
          setName(u.name);
          setBio(u.bio || "");
        }
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    if (
      (name !== user.name || username !== user.username || bio !== user.bio) &&
      !changed
    ) {
      setChanged(true);
    } else if (
      name === user.name &&
      username === user.username &&
      bio === user.bio &&
      changed
    ) {
      setChanged(false);
    }
  }, [name, username, bio, user]);

  const handleCancel = () => {
    if (!user) return;
    setBio(user.bio || "");
    setName(user.name);
    setUsername(user.username);
  };
  
  console.log(user);
  

  const handleSave = async () => {
    if (!changed || !user) return;
    const regex = /^[a-zA-Z0-9_.]+$/;
    if (
      !username.trim() ||
      !name.trim() ||
      !bio.trim() ||
      !regex.test(username)
    )
      return;

    const res = await fetch("/api/user", {
      ...ApiConfig.put,
      body: JSON.stringify({ name, username, bio }),
    });
    const data = await res.json();
    console.log(data);
    
    if (data.ok) {
      setUser((prev) => ({
        ...prev!,
        bio: data.user.bio,
        name: data.user.name,
        username: data.user.username,
      }));
    }
  };

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
                    <Input
                      value={f.state}
                      onChange={(e) => f.setState(e.target.value)}
                      className="w-fit"
                    />
                  ) : (
                    <DefaultTextarea
                      value={f.state}
                      onChange={(e) => f.setState(e.target.value)}
                      className="w-61"
                    />
                  )}
                  {f.description && (
                    <CardDescription className="mt-2">
                      {f.description}
                    </CardDescription>
                  )}
                </div>
              </div>
              <Line className="my-5" />
            </div>
          ))}
        </CardContent>
        <CardFooter className="justify-end">
          <div className="flex gap-3 font-plusJakartaSans">
            <Button
              variant={"secondary"}
              onClick={handleCancel}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant={!changed ? "disabled" : "destructive"}
              className={`${changed ? "cursor-pointer" : ""}`}
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfileEditPage;
