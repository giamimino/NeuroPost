import z from "zod";

export const StatsEndpointEnum = z.enum(["LIKES", "FOLLOWERS", "FOLLOWING"])

export type StatsEndpointType = z.infer<typeof StatsEndpointEnum>