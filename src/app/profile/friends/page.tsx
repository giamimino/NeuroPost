import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRoundPlus, UsersRound } from "lucide-react";
import React, { useState } from "react";

const FriendsPage = () => {
  const [section, setSection] = useState("friend_requests")
  const [friendRequests, setFriendRequests] = useState()
  const pages = [
    {
      id: "friend_requests",
      label: "Friend Requests",
      icon: <UserRoundPlus />,
    },
    {
      id: "all_friends",
      label: "All friends",
      icon: <UsersRound />,
    },
  ];

  

  return (
    <div className="w-full pt-20 pl-5">
      <div className="max-w-50 w-full mt-15">
        <Card className="py-4">
          <div className="px-4">
            <CardTitle>Friends</CardTitle>
          </div>
          <div>
            <nav className="flex flex-col gap-2">
              {pages.map((page) => (
                <Button
                  variant={"ghost"}
                  key={`${page.label}`}
                  className={"w-full rounded-none cursor-pointer justify-start"}
                  // onClick={() => router.push(`/profile/${page.url}`)}
                >
                  <Button size={"icon-xs"} className="rounded-sm" variant={"secondary"}>{page.icon}</Button>
                  <p
                  // className={
                  //   pathname === page.url
                  //     ? "text-current font-bold"
                  //     : "text-current/90"
                  // }
                  >
                    {page.label}
                  </p>
                </Button>
              ))}
            </nav>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FriendsPage;
