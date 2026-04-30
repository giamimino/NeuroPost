import { RepliesAction, RepliesState } from "@/types/reducer";

function repliesReducer(
  state: RepliesState,
  action: RepliesAction,
): RepliesState {
  switch (action.type) {
    case "SET_REPLIES": {
      const next = new Map(state);
      next.set(action.comment_id, action.replies);
      console.log(action);
      
      return next;
    }

    default:
      return state;
  }
}

export { repliesReducer };
