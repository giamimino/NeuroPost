import { Card, CardContent, CardFooter, CardHeader } from "./card";
import { Skeleton } from "./skeleton";


function SkeletonCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="aspect-video w-full" />
      </CardContent>
    </Card>
  )
}

function SkeletonPost({ className }: {className?: string}) {
  return (
    <Card className={`gap-4 ${className}`}>
      <CardHeader>
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="w-full aspect-4/1" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-4 w-1/3" />
      </CardFooter>
    </Card>
  )
}

export { SkeletonCard, SkeletonPost }