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
      const { comment_id, payload } = action;
      const next = new Map(state);
      const set = next.get(comment_id);

      if (!set) return state;

      const updated = new Set(set ?? []);

      updated.add(payload);

      next.set(comment_id, updated);

      return next;
    }

    case "DEL_REPLY": {
      const { comment_id, reply_id } = action;
      const next = new Map(state);
      const set = next.get(comment_id);

      if (!set) return state;

      const updated = new Set(set ?? []);

      for (const item of updated) {
        if (item.id === reply_id) {
          updated.delete(item);
        }
      }

      if (updated.size === 0) {
        next.delete(comment_id);
      } else {
        next.set(comment_id, updated);
      }

      return next;
    }

    case "INCREMENT_REPLY_COUNT": {
      const { reply_id } = action;

      const next = new Map(state);

      for (const [parentId, replies] of next.entries()) {
        const updated = new Set(
          [...replies].map((r) =>
            r.id === reply_id
              ? { ...r, replies_count: Math.max(0, r.replies_count + 1) }
              : r,
          ),
        );

        next.set(parentId, updated);
      }

      return next;
    }

    case "DECREMENT_REPLY_COUNT": {
      const { reply_id } = action;

      const next = new Map(state);

      for (const [parentId, replies] of next.entries()) {
        const updated = new Set(
          [...replies].map((r) =>
            r.id === reply_id
              ? { ...r, replies_count: Math.max(0, r.replies_count - 1) }
              : r,
          ),
        );

        next.set(parentId, updated);
      }

      return next;
    }

    default:
      return state;
  }
}

export { repliesReducer };
