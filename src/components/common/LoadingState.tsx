import { cn } from "@/lib/utils";

interface LoadingStateProps {
  variant: "card" | "grid" | "profile";
  count?: number;
  className?: string;
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-lg bg-gris-clair", className)} />
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-gris-bordure p-0 overflow-hidden">
      <SkeletonBlock className="aspect-square w-full rounded-none" />
      <div className="p-4 space-y-3">
        <SkeletonBlock className="h-5 w-3/4" />
        <SkeletonBlock className="h-4 w-1/2" />
        <div className="flex gap-1">
          <SkeletonBlock className="h-5 w-16 rounded-full" />
          <SkeletonBlock className="h-5 w-20 rounded-full" />
        </div>
        <SkeletonBlock className="h-3 w-1/3" />
      </div>
    </div>
  );
}

function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

function SkeletonProfile() {
  return (
    <div className="space-y-6">
      <SkeletonBlock className="h-4 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SkeletonBlock className="aspect-[4/5] w-full" />
        <div className="space-y-4 py-8">
          <SkeletonBlock className="h-10 w-3/4" />
          <SkeletonBlock className="h-5 w-1/2" />
          <SkeletonBlock className="h-4 w-40" />
          <SkeletonBlock className="h-4 w-36" />
          <div className="flex gap-2 pt-2">
            <SkeletonBlock className="h-6 w-20 rounded-full" />
            <SkeletonBlock className="h-6 w-24 rounded-full" />
          </div>
          <SkeletonBlock className="h-20 w-full mt-4" />
        </div>
      </div>
    </div>
  );
}

export function LoadingState({ variant, count, className }: LoadingStateProps) {
  return (
    <div className={className}>
      {variant === "card" && <SkeletonCard />}
      {variant === "grid" && <SkeletonGrid count={count} />}
      {variant === "profile" && <SkeletonProfile />}
    </div>
  );
}
