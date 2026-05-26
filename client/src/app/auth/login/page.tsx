"use client";
import BlurWrapper from "@/components/BlurWrapper";
import DefaultInput from "@/components/common/DefaultInput";
import PasswordInput from "@/components/common/PasswordInput";
import { ApiConfig } from "@/configs/api-configs";
import { ERRORS } from "@/constants/error-handling";
import { LoginSchema } from "@/schemas/auth/login.schema";
import { useAlertStore } from "@/store/zustand/alert.store";
import { useRouter } from "next/navigation";
import React from "react";

const LoginPage = () => {
  const router = useRouter();
  const { addAlert } = useAlertStore();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      const formData = new FormData(e.currentTarget);

      const email = (formData.get("email") as string) || "";
      const password = (formData.get("current-password") as string) || "";

      const parsed = LoginSchema.safeParse({ email, password });
      if (!parsed.success) {
        const message = JSON.parse(parsed.error.issues[0].message);

        addAlert({
          id: crypto.randomUUID(),
          type: "error",
          ...message,
        });
        return;
      }
      const url = "/api/auth/login";
      const res = await fetch(url, {
        ...ApiConfig.post,
        body: JSON.stringify(parsed.data),
      });
      const data = await res?.json();
      console.log(data);

      if (data?.ok) {
        router.push("/profile");
      } else if (data.error) {
        addAlert({ id: crypto.randomUUID(), type: "error", ...data.error });
      }
    } catch {
      addAlert({
        id: crypto.randomUUID(),
        type: "error",
        ...ERRORS.GENERIC_ERROR,
      });
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
          <form className="flex flex-col gap-6" onSubmit={handleLogin}>
            <div className="flex flex-col gap-4.5">
              <DefaultInput
                icon="eva:email-outline"
                placeholder="Email"
                name="email"
                autoComplete="email"
                type="email"
              />
              <PasswordInput
              />
            </div>
            <div className="flex justify-between text-foreground">
              <div></div>
              <button
                type="button"
                onClick={() => router.push("/auth/password_reset")}
                className="font-semibold font-plusJakartaSans hover:underline cursor-pointer text-xs"
              >
                Forgot Password?
              </button>
            </div>
            <button
              type="submit"
              className="rounded-md bg-foreground text-secondary-bg font-inter py-3 cursor-pointer font-medium text-sm hover:bg-foreground/60"
            >
              Log In
            </button>
          </form>
          <div className="flex items-center gap-1">
            <p className="text-white font-plusJakartaSans text-sm">
              {`Don't`} have an account?
            </p>
            <button
              className="text-blue-400 hover:text-blue-500 cursor-pointer underline"
              onClick={() => router.push("/auth/register")}
            >
              register
            </button>
          </div>
        </BlurWrapper>
      </div>
    </div>
  );
};

export default LoginPage;
