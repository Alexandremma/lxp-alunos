import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingLearningProps {
  type: "card" | "list" | "detail" | "grid";
  count?: number;
  className?: string;
}

const CardSkeleton = () => (
  <div className="rounded-xl border border-border bg-card overflow-hidden">
    <Skeleton className="h-40 w-full rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-4 pt-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-2 w-full" />
    </div>
  </div>
);

const ListItemSkeleton = () => (
  <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card">
    <Skeleton className="h-12 w-12 rounded-lg" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-1/3" />
    </div>
    <Skeleton className="h-5 w-5 rounded-full" />
  </div>
);

const DetailSkeleton = () => (
  <div className="space-y-6">
    {/* Hero */}
    <Skeleton className="h-64 w-full rounded-xl" />
    
    {/* Content */}
    <div className="space-y-4">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>

    {/* Modules */}
    <div className="space-y-3">
      <Skeleton className="h-6 w-32" />
      {[1, 2, 3].map((i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  </div>
);

const GridSkeleton = ({ count }: { count: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const LoadingLearning = ({
  type,
  count = 3,
  className,
}: LoadingLearningProps) => {
  return (
    <div className={cn("animate-pulse", className)}>
      {type === "card" && <CardSkeleton />}
      {type === "list" && (
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      )}
      {type === "detail" && <DetailSkeleton />}
      {type === "grid" && <GridSkeleton count={count} />}
    </div>
  );
};
