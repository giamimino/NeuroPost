export type HandleLikeArgs =
  | { action: "post"; userId: string; postId: number }
  | { action: "delete"; id: string };