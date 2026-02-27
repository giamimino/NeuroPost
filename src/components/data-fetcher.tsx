"use client";
import React, { useEffect, useMemo, useState } from "react";

type FetchConfig = RequestInit & {
  enabled?: boolean;
};

export interface Props<T> {
  url: string;
  config?: FetchConfig;
  errorUI?: React.ReactNode;
  loadingUI?: React.ReactNode;
  children: (data: T) => React.ReactNode;
  targetKey?: string;
}

const DataFetcher = <T,>({
  url,
  config,
  errorUI,
  loadingUI,
  children,
  targetKey,
}: Props<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (config?.enabled === false) return;

    const controller = new AbortController();

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(url, { ...config, signal: controller.signal });
        if (!res.ok) throw new Error("Fetch Error");
        const json = await res.json();
        setData(targetKey ? json[targetKey] : json);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        if (error instanceof Error) setError(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      controller.abort();
    };
  }, [url, config?.enabled, targetKey]);

  if (loading) return loadingUI ?? <div>loading...</div>;
  if (error)
    return (
      errorUI ?? <div className="text-foreground">Something went wrong.</div>
    );
  if (data === null) return null;

  return <>{children(data)}</>;
};

export default DataFetcher;
