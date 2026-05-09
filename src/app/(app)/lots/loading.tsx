import { CardSkeleton } from "@/components/Skeleton";
import PageContainer from "@/components/PageContainer";

export default function LotsLoading() {
  return (
    <PageContainer className="py-4">
      <div className="h-10 w-1/3 rounded-xl bg-neutral-200 animate-pulse mb-4" />
      <div className="h-11 rounded-xl bg-neutral-200 animate-pulse mb-3" />
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-8 w-20 rounded-lg bg-neutral-200 animate-pulse" />)}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </PageContainer>
  );
}
