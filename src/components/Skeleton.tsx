interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-neutral-200 ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 flex flex-col gap-2">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}
