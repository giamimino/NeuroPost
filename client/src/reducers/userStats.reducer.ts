import { UserStatsPreviewUserType } from "@/types/neon";
import { UserStatsAction, UserStatsState } from "@/types/reducer";
import { unionSets } from "@/utils/unionSet";

function userStatsReducer(
  state: UserStatsState,
  action: UserStatsAction,
): UserStatsState {
  switch (action.type) {
    case "ADD_STATS": {
      const { key, newStats } = action;

      const next = new Map(state);
      const set = next.get(key) ?? new Set<UserStatsPreviewUserType & { likes_count?: number }>();

      const updated = unionSets(set, newStats)
      next.set(key, updated);

      return next;
    }

    default:
      return state;
  }
}

export { userStatsReducer }
