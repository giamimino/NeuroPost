import { CardDescription } from "./card";

function TagItem({id, tag, onClick}: { id?: string, tag: string, onClick?: () => void}) {
  return (
    <div key={`${id}-tag-${tag}`} className="p-1 px-2 rounded-sm border border-card-border" onClick={onClick}>
      <CardDescription className="cursor-pointer">{tag}</CardDescription>
    </div>
  );
}

export { TagItem }