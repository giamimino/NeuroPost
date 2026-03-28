"use client";
import React, { Suspense } from "react";
import VerifyClient from "./VerifyClient";

const VerifyPage = () => {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <VerifyClient />
    </Suspense>
  );
};

export default VerifyPage;
