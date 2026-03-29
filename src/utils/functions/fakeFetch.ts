import { ERRORS } from "@/constants/error-handling";

type fakeFetchType =
  | {
      data: any;
      error?: { title: string; description: string };
    }
  | { data?: any; error: { title: string; description: string } };

const fakeFetch = (): Promise<fakeFetchType> => {
  return new Promise<fakeFetchType>((resolve) =>
    setTimeout(
      () =>
        resolve(
          Math.floor(Math.random() * 20) > 10
            ? { data: { ok: true } }
            : { error: ERRORS.GENERIC_ERROR },
        ),
      1500,
    ),
  );
};

export default fakeFetch;
