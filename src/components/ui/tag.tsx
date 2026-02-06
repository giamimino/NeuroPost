import { CardDescription } from "./card";

function TagItem({id, tag}: { id?: string, tag: string}) {
  return (
    <div key={`${id}-tag-${tag}`}>
      <CardDescription className="cursor-pointer">{tag}</CardDescription>
    </div>
  );
}

export { TagItem }