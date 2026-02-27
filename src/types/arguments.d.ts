export type HandleLikeArgs =
  | { action: "post"; postId: number }
  | { action: "delete"; id: string };
