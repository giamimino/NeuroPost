"use client";

import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
// import indexPost from "@/utils/indexPost";

export default function TestPage() {
  const post = {
    id: 324,
    title: "Suggero vicissitudo.",
    description:
      "Quisquam thesaurus virga iure atrocitas calco ipsam vulariter quia tardus. Terra molestias est stips triduana quasi demum. Aut maiores volup. Accusator venio undique ocer. annus",
  } as const;

  return (
    <div className="pt-20">
      <div className="p-4 flex flex-col gap-4">
        {Object.entries(post).map(([key, value]) => (
          <CardDescription key={key}>
            {key}: {value}
          </CardDescription>
        ))}
        <Button
          className="w-fit"
          variant={"destructive"}
          // onClick={async () => {
          //   const result = await indexPost(post);

          //   console.log(result);
          // }}
        >
          Test
        </Button>
      </div>
    </div>
  );
}
