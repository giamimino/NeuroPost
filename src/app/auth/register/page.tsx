"use client";
import BlurWrapper from "@/components/BlurWrapper";
import DefaultInput from "@/components/common/DefaultInput";
import { ApiConfig } from "@/configs/api-configs";
import { apiFetch } from "@/lib/apiFetch";
import { useRouter } from "next/navigation";
import React from "react";

const RegisterPage = () => {
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!username.trim() || !email.trim() || !password.trim()) return;

    const url = "/api/auth/register";
    const res = await apiFetch(url, {
      ...ApiConfig.post,
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res?.json();

    if (data.success) {
      router.push("/profile");
    }
  };
  return (
    <div>
      <div className="w-full h-screen flex justify-center items-center">
        <BlurWrapper>
          <div className="font-plusJakartaSans flex flex-col gap-1.5">
            <h1 className="text-white text-3xl font-normal">Welcome Back!</h1>
            <p className="text-sm tracking-wide text-foreground">
              Log in to access posting and commenting.
            </p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4.5">
              <DefaultInput
                name="username"
                icon="humbleicons:user"
                placeholder="Username"
              />
              <DefaultInput
                name="email"
                icon="eva:email-outline"
                placeholder="Email"
              />
              <DefaultInput
                name="password"
                icon="gg:lock"
                placeholder="Password"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-foreground text-secondary-bg font-inter py-3 cursor-pointer font-medium text-sm hover:bg-foreground/60"
            >
              Register
            </button>
          </form>
          <div className="flex items-center gap-1">
            <p className="text-white font-plusJakartaSans text-sm">
              Alreadt have an account?
            </p>
            <button
              className="text-blue-400 hover:text-blue-500 cursor-pointer underline"
              onClick={() => router.push("/auth/login")}
            >
              Login
            </button>
          </div>
        </BlurWrapper>
      </div>
    </div>
  );
};

export default RegisterPage;
