"use client";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { ApiConfig } from "@/configs/api-configs";
import { ERRORS } from "@/constants/error-handling";
import { apiFetch } from "@/lib/apiFetch";
import { useAlertStore } from "@/store/zustand/alertStore";
import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const VerifyClient = () => {
  const [isSend, setIsSend] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const searchParams = useSearchParams();
  const { addAlert } = useAlertStore();
  const isToken = searchParams.get("token");

  const handleSend = async () => {
    try {
      if (isSend)
        return addAlert({
          id: crypto.randomUUID(),
          type: "error",
          ...ERRORS.EMAIL_VERIFICATIONS_ALREADY_SENT,
        });
      const res = await apiFetch("/api/send", ApiConfig.post);
      const data = await res?.json();

      if (data.ok) {
        setIsSend(true);
        console.log(data);
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

  useEffect(() => {
    if (!isToken) return;

    fetch("/api/send/verify", {
      ...ApiConfig.post,
      body: JSON.stringify({ token: isToken }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setIsVerified(true);
        } else if (data.error) {
          addAlert({ id: crypto.randomUUID(), type: "error", ...data.error });
        }
      });
  }, [isToken]);

  return (
    <div className="pt-20 flex justify-center">
      {isToken ? (
        <div className="flex flex-col items-center gap-3 text-center">
          {isVerified ? (
            <CardTitle className="text-xl">Account verified</CardTitle>
          ) : (
            <CardTitle className="text-xl text-muted-foreground animate-pulse">
              Verifing your account...
            </CardTitle>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-center ">
          <CardTitle className="text-xl">
            Verify your email to activate your account
          </CardTitle>

          <p className="text-sm text-muted-foreground">
            We’ll send a verification link to your email address.
          </p>

          <div className="flex flex-col gap-1">
            <Button
              variant={"outline"}
              className={clsx(isSend ? "cursor-not-allowed" : "cursor-pointer")}
              onClick={handleSend}
            >
              Send verification email
            </Button>
            {isSend && (
              <p className="text-muted-foreground text-sm">
                Verification link sent.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyClient;
