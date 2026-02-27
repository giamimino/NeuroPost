import { ApiConfig } from "@/configs/api-configs";
import { apiFetch } from "@/lib/apiFetch";
import { HandleLikeArgs } from "@/types/arguments";

export const handleLike = async (args: HandleLikeArgs) => {
  try {
    const res = await apiFetch("/api/post/like", {
      ...ApiConfig[args.action],
      body: JSON.stringify(
        args.action === "post"
          ? {
              postId: args.postId,
            }
          : { id: args.id },
      ),
    });
    const data = await res?.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};
