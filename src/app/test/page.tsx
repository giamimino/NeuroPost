"use client";
import { ApiConfig } from "@/configs/api-configs";
import React, { useEffect } from "react";

const TestPage = () => {
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    fetch("/api/test", { ...ApiConfig.get, signal })
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.error(err));

    return () => controller.abort();
  }, []);
  return <div></div>;
};

export default TestPage;
