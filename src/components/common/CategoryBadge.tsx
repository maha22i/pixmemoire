import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  name: string;
  slug?: string;
  className?: string;
}

export function CategoryBadge({ name, slug, className }: CategoryBadgeProps) {
  const badge = (
    <Badge variant="default" className={cn(slug && "hover:bg-primary-hover cursor-pointer", className)}>
      {name}
    </Badge>
  );

  if (slug) {
    return <Link href={`/categories/${slug}`}>{badge}</Link>;
  }

  return badge;
}
