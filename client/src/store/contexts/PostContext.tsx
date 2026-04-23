import { PostContextType } from "@/types/context";
import { createContext, useContext } from "react";

export const PostContext = createContext<PostContextType | null>(null)

export const usePostContext = () => {
  const ctx = useContext(PostContext)
  if(!ctx) throw new Error(
    "usePostContext must be used withing a provider"
  )
  return ctx
}