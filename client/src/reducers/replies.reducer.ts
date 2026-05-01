import { RepliesAction, RepliesState } from "@/types/reducer";

function repliesReducer(
  state: RepliesState,
  action: RepliesAction,
): RepliesState {
  switch (action.type) {
    case "SET_REPLIES": {
      const next = new Map(state);
      next.set(action.comment_id, action.replies);
      
      return next;
    }
    case "ADD_REPLY": {
      const { comment_id, payload } = action
      const next = new Map(state)
      const set = next.get(comment_id)

      if(!set) return state

      const updated = new Set(set)

      updated.add(payload)

      next.set(comment_id, updated)

      return next
    }

    default:
      return state;
  }
}

export { repliesReducer };
