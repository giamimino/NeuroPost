import useUserStatsPreview from "@/hook/useUserStatsPreview"
import { StatsEndpointType } from "@/schemas/common/enums.schema";
import { UserStatsPreviewContext } from "@/store/contexts/UserStats.context";
import React from "react";

export default function UserStatsPreviewProvider({
  preview,
  username,
  children
}: {
  preview: StatsEndpointType & "none";
  username: string;
  children: React.ReactNode
}) {
  const { data, status } = useUserStatsPreview(preview, username, true, false)

  const values = data ? {
    type: preview,
    payload: data,
    status
  } : null

  if(preview === "none") return null

  return (
    <UserStatsPreviewContext value={values}>
      {children}
    </UserStatsPreviewContext>
  )
}
