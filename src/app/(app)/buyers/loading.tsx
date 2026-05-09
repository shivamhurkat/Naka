import { CardSkeleton } from "@/components/Skeleton";
import PageContainer from "@/components/PageContainer";

export default function BuyersLoading() {
  return (
    <PageContainer className="py-4">
      <div className="h-10 w-1/3 rounded-xl bg-neutral-200 animate-pulse mb-4" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </PageContainer>
  );
}
