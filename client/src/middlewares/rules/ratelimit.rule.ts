export const RateLimitRules = [
  { match: /^\/api\/auth\/login/, limit: 5 },
  { match: /^\/api\/auth\/register/, limit: 3 },
  { match: /^\/api\/auth\/logout/, limit: 10 },
  { match: /^\/api\/auth\/refresh/, limit: 10 },

  { match: /^\/api\/follow/, limit: 20 },
  { match: /^\/api\/friend-request/, limit: 10 },
  { match: /^\/api\/pending-friends/, limit: 30 },
  { match: /^\/api\/friends/, limit: 30 },

  { match: /^\/api\/notifications\/read/, limit: 30 },
  { match: /^\/api\/notifications/, limit: 60 },

  { match: /^\/api\/post\/like/, limit: 60 },
  { match: /^\/api\/post\/comment/, limit: 30 },
  { match: /^\/api\/post\/foryou/, limit: 60 },
  { match: /^\/api\/post\/p/, limit: 60 },
  { match: /^\/api\/post\/u/, limit: 60 },
  { match: /^\/api\/post/, limit: 60 },

  { match: /^\/api\/r2/, limit: 20 },

  { match: /^\/api\/redis/, limit: 10 },

  { match: /^\/api\/search/, limit: 30 },
  { match: /^\/api\/search\/posts/, limit: 30 },
  { match: /^\/api\/search\/u/, limit: 30 },

  { match: /^\/api\/send\/code/, limit: 3 },
  { match: /^\/api\/send\/code\/check/, limit: 10 },
  { match: /^\/api\/send\/password_reset/, limit: 3 },
  { match: /^\/api\/send\/password_reset\/check/, limit: 10 },
  { match: /^\/api\/send\/verify/, limit: 3 },
  { match: /^\/api\/send/, limit: 5 },

  { match: /^\/api\/tags/, limit: 30 },

  { match: /^\/api\/user\/u\/[^/]+\/stats$/, limit: 60 },
  { match: /^\/api\/user\/u\/[^/]+$/, limit: 60 },
  { match: /^\/api\/user\/profile/, limit: 30 },
  { match: /^\/api\/user\/settings/, limit: 20 },
  { match: /^\/api\/user\/change_password/, limit: 5 },
  { match: /^\/api\/user/, limit: 30 },

  { match: /^\/api\/cron-jobs/, limit: 1 },
  { match: /^\/api\/index/, limit: 60 },
];