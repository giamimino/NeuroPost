import { repliesReducer } from "@/reducers/replies.reducer";
import { CommentReplyType } from "@/schemas/comment/reply.schema";
import { CommentRepliesContext } from "@/store/contexts/CommentCntext";
import { CommentRepliesContextType } from "@/types/context";
import { Children } from "@/types/global";
import { useReducer } from "react";


export default function CommentRepliesProvider({ children }: Children) {
  const [repliesCache, dispatch] = useReducer(repliesReducer, new Map<string, Set<CommentReplyType>>())

  const values = {
    repliesCache,
    dispatch
  } as CommentRepliesContextType
  
  return (
    <CommentRepliesContext value={values}>
      {children}
    </CommentRepliesContext>
  )
}
