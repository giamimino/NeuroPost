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

export default function DataFetcher<T>({
  url,
  config,
  errorUI,
  loadingUI,
  children,
  targetKey,
}: Props<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const memoConfig = useMemo(() => config, [JSON.stringify(config)]);

  useEffect(() => {
    if (config?.enabled === false) return;

    let ignore = false;

    async function fetchData() {
      try {
        setLoading(true)
        const res = await fetch(url, config);
        if (!res.ok) throw new Error("Fetch Error");
        const json = await res.json();
        if (!ignore) setData(targetKey ? json[targetKey] : json);
      } catch (error: any) {
        if (!ignore) setError(error);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [url, memoConfig]);

  if (loading) return loadingUI ?? <div>loading...</div>;
  if (error)
    return (
      errorUI ?? <div className="text-foreground">Something went wrong.</div>
    );
  if (!data) return null;

  return <>{children(data)}</>;
}
